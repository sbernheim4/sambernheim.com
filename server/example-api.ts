import type { IncomingMessage, ServerResponse } from 'node:http'

const readModelLagMs = 2500

type Organization = {
  id: string
  name: string
  sector: 'healthcare' | 'finance' | 'education'
  status: 'active' | 'paused'
  region: 'east' | 'central' | 'west'
  updatedAt: string
}

type Project = {
  id: string
  organizationId: string
  name: string
  priority: 'low' | 'medium' | 'high'
  phase: 'planning' | 'implementation' | 'launched'
  budget: string
  updatedAt: string
}

type Task = {
  id: string
  organizationId: string
  projectId: string
  title: string
  owner: 'alex' | 'jordan' | 'morgan'
  status: 'todo' | 'in-progress' | 'blocked'
  dueWindow: 'this-week' | 'next-week' | 'this-month'
  updatedAt: string
}

type Store = {
  organizations: Organization[]
  projects: Project[]
  tasks: Task[]
}

type RequestBody = Record<string, unknown>

let nextId = 2
const writeStore: Store = {
  organizations: [
    {
      id: 'org-1',
      name: 'Existing Clinic',
      sector: 'healthcare',
      status: 'active',
      region: 'east',
      updatedAt: new Date().toISOString(),
    },
  ],
  projects: [
    {
      id: 'project-1',
      organizationId: 'org-1',
      name: 'Care Navigation',
      priority: 'high',
      phase: 'implementation',
      budget: '$125k',
      updatedAt: new Date().toISOString(),
    },
  ],
  tasks: [
    {
      id: 'task-1',
      organizationId: 'org-1',
      projectId: 'project-1',
      title: 'Configure intake routing',
      owner: 'alex',
      status: 'in-progress',
      dueWindow: 'this-week',
      updatedAt: new Date().toISOString(),
    },
  ],
}
let readStore: Store = structuredClone(writeStore)

export async function handleApiRequest(
  request: IncomingMessage,
  response: ServerResponse,
) {
  try {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname
    const editMatch = path.match(/^\/api\/(organizations|projects|tasks)\/([^/]+)$/)
    if (request.method === 'PATCH' && editMatch) {
      const collection = editMatch[1] as keyof Store
      const entity = writeStore[collection].find((item) => item.id === editMatch[2])
      if (!entity) return sendJson(response, { message: 'Resource not found.' }, 404)
      const body = await readJson(request)
      if (collection === 'organizations') {
        const organization = entity as Organization
        Object.assign(organization, {
          name: cleanString(body.name, organization.name),
          sector: oneOf(body.sector, ['healthcare', 'finance', 'education'], organization.sector),
          status: oneOf(body.status, ['active', 'paused'], organization.status),
          region: oneOf(body.region, ['east', 'central', 'west'], organization.region),
          updatedAt: new Date().toISOString(),
        })
        scheduleReplicaSync()
        return sendJson(response, { organization, readModelLagMs })
      }
      if (collection === 'projects') {
        const project = entity as Project
        Object.assign(project, {
          name: cleanString(body.name, project.name),
          priority: oneOf(body.priority, ['low', 'medium', 'high'], project.priority),
          phase: oneOf(body.phase, ['planning', 'implementation', 'launched'], project.phase),
          budget: cleanString(body.budget, project.budget),
          updatedAt: new Date().toISOString(),
        })
        scheduleReplicaSync()
        return sendJson(response, { project, readModelLagMs })
      }
      const task = entity as Task
      Object.assign(task, {
        title: cleanString(body.title, task.title),
        owner: oneOf(body.owner, ['alex', 'jordan', 'morgan'], task.owner),
        status: oneOf(body.status, ['todo', 'in-progress', 'blocked'], task.status),
        dueWindow: oneOf(body.dueWindow, ['this-week', 'next-week', 'this-month'], task.dueWindow),
        updatedAt: new Date().toISOString(),
      })
      scheduleReplicaSync()
      return sendJson(response, { task, readModelLagMs })
    }

    if (request.method === 'DELETE' && request.url === '/api/entities') {
      writeStore.tasks = []
      writeStore.projects = []
      writeStore.organizations = []
      readStore = structuredClone(writeStore)
      return sendJson(response, readStore)
    }

    if (request.method === 'GET' && request.url === '/api/bootstrap') {
      return sendJson(response, readStore)
    }

    if (request.method === 'POST' && request.url === '/api/organizations') {
      const body = await readJson(request)
      const organization = {
        id: `org-${nextId++}`,
        name: cleanString(body.name, 'Untitled organization'),
        sector: oneOf(body.sector, ['healthcare', 'finance', 'education'], 'healthcare'),
        status: oneOf(body.status, ['active', 'paused'], 'active'),
        region: oneOf(body.region, ['east', 'central', 'west'], 'east'),
        updatedAt: new Date().toISOString(),
      }

      writeStore.organizations.push(organization)
      scheduleReplicaSync()

      return sendJson(response, { organization, readModelLagMs })
    }

    if (request.method === 'POST' && request.url === '/api/projects') {
      const body = await readJson(request)
      if (!writeStore.organizations.some((item) => item.id === body.organizationId)) {
        return sendJson(response, { message: 'Choose an existing organization.' }, 400)
      }
      const project = {
        id: `project-${nextId++}`,
        organizationId: cleanString(body.organizationId, ''),
        name: cleanString(body.name, 'Untitled project'),
        priority: oneOf(body.priority, ['low', 'medium', 'high'], 'medium'),
        phase: oneOf(body.phase, ['planning', 'implementation', 'launched'], 'planning'),
        budget: cleanString(body.budget, '$50k'),
        updatedAt: new Date().toISOString(),
      }

      writeStore.projects.push(project)
      scheduleReplicaSync()

      return sendJson(response, { project, readModelLagMs })
    }

    if (request.method === 'POST' && request.url === '/api/tasks') {
      const body = await readJson(request)
      const parent = writeStore.projects.find((item) => item.id === body.projectId)
      if (!parent || parent.organizationId !== body.organizationId) {
        return sendJson(response, { message: 'Choose a project belonging to this organization.' }, 400)
      }
      const task = {
        id: `task-${nextId++}`,
        organizationId: cleanString(body.organizationId, ''),
        projectId: cleanString(body.projectId, ''),
        title: cleanString(body.title, 'Untitled task'),
        owner: oneOf(body.owner, ['alex', 'jordan', 'morgan'], 'alex'),
        status: oneOf(body.status, ['todo', 'in-progress', 'blocked'], 'todo'),
        dueWindow: oneOf(body.dueWindow, ['this-week', 'next-week', 'this-month'], 'this-week'),
        updatedAt: new Date().toISOString(),
      }

      writeStore.tasks.push(task)
      scheduleReplicaSync()

      return sendJson(response, { task, readModelLagMs })
    }

    response.writeHead(404)
    response.end('Not found')
  } catch (error) {
    response.writeHead(500)
    response.end(error instanceof Error ? error.message : 'Unknown error')
  }
}

function scheduleReplicaSync() {
  setTimeout(() => {
    readStore = structuredClone(writeStore)
  }, readModelLagMs)
}

function sendJson(response: ServerResponse, value: unknown, status = 200) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })
  response.end(JSON.stringify(value))
}

async function readJson(request: IncomingMessage): Promise<RequestBody> {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function cleanString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function oneOf<TValue extends string>(
  value: unknown,
  allowed: readonly TValue[],
  fallback: TValue,
) {
  return typeof value === 'string' && allowed.includes(value as TValue)
    ? (value as TValue)
    : fallback
}
