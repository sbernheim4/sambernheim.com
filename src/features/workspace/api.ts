import type { BootstrapData, SaveOrganizationInput, SaveProjectInput, SaveTaskInput, SaveOrganizationResponse, SaveProjectResponse, SaveTaskResponse } from './types'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

export async function fetchBootstrap() {
  return request<BootstrapData>('/api/bootstrap')
}

export async function clearEntities() {
  return request<BootstrapData>('/api/entities', { method: 'DELETE' })
}

export async function saveOrganization(input: SaveOrganizationInput) {
  return request<SaveOrganizationResponse>('/api/organizations', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(input),
  })
}

export async function saveProject(input: SaveProjectInput) {
  return request<SaveProjectResponse>('/api/projects', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(input),
  })
}

export async function saveTask(input: SaveTaskInput) {
  return request<SaveTaskResponse>('/api/tasks', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(input),
  })
}

export function updateOrganization(id: string, input: SaveOrganizationInput) {
  return patch<SaveOrganizationResponse>('organizations', id, input)
}

export function updateProject(id: string, input: Omit<SaveProjectInput, 'organizationId'>) {
  return patch<SaveProjectResponse>('projects', id, input)
}

export function updateTask(id: string, input: Omit<SaveTaskInput, 'organizationId' | 'projectId'>) {
  return patch<SaveTaskResponse>('tasks', id, input)
}

function patch<T>(collection: string, id: string, input: unknown) {
  return request<T>(`/api/${collection}/${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: jsonHeaders, body: JSON.stringify(input),
  })
}

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init)

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json() as Promise<T>
}
