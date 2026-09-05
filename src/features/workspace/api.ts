import type { BootstrapData, Organization, Project, Task, SaveOrganizationInput, SaveProjectInput, SaveTaskInput, SaveOrganizationResponse, SaveProjectResponse, SaveTaskResponse } from './types'

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
    throw new ApiError(response.status, await response.text())
  }

  return response.json() as Promise<T>
}

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
export const fetchOrganizations = () => request<Organization[]>('/api/organizations')
export const fetchOrganization = (id: string) => request<Organization>(`/api/organizations/${encodeURIComponent(id)}`)
export const fetchProjects = () => request<Project[]>('/api/projects')
export const fetchOrganizationProjects = (id: string) => request<Project[]>(`/api/organizations/${encodeURIComponent(id)}/projects`)
export const fetchProject = (id: string) => request<Project>(`/api/projects/${encodeURIComponent(id)}`)
export const fetchTasks = () => request<Task[]>('/api/tasks')
export const fetchProjectTasks = (id: string) => request<Task[]>(`/api/projects/${encodeURIComponent(id)}/tasks`)
export const fetchTask = (id: string) => request<Task>(`/api/tasks/${encodeURIComponent(id)}`)
