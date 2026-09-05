import type { CacheUpdate } from '../../forms/orchestration/contracts'
import type { Organization, Project, Task, SaveOrganizationResponse, SaveProjectResponse, SaveTaskResponse } from './types'
import { upsertBootstrap } from './cache'
import { workspaceKeys as keys, bootstrapKey } from './queries'

export function organizationCacheUpdates<I>(): CacheUpdate<SaveOrganizationResponse, I>[] {
  return [
    { queryKey: () => bootstrapKey, update: (previous, { response }) => upsertBootstrap(previous, { organizations: [response.organization] }) },
    { queryKey: () => keys.organizations.list(), update: (previous, { response }) => upsertList(previous, response.organization) },
    { queryKey: ({ response }) => keys.organizations.detail(response.organization.id), getData: (response) => response.organization },
  ]
}
export function projectCacheUpdates<I>(): CacheUpdate<SaveProjectResponse, I>[] {
  return [
    { queryKey: () => bootstrapKey, update: (previous, { response }) => upsertBootstrap(previous, { projects: [response.project] }) },
    { queryKey: () => keys.projects.list(), update: (previous, { response }) => upsertList(previous, response.project) },
    { queryKey: ({ response }) => keys.projects.forOrganization(response.project.organizationId), update: (previous, { response }) => upsertList(previous, response.project) },
    { queryKey: ({ response }) => keys.projects.detail(response.project.id), getData: (response) => response.project },
  ]
}
export function taskCacheUpdates<I>(): CacheUpdate<SaveTaskResponse, I>[] {
  return [
    { queryKey: () => bootstrapKey, update: (previous, { response }) => upsertBootstrap(previous, { tasks: [response.task] }) },
    { queryKey: () => keys.tasks.list(), update: (previous, { response }) => upsertList(previous, response.task) },
    { queryKey: ({ response }) => keys.tasks.forProject(response.task.projectId), update: (previous, { response }) => upsertList(previous, response.task) },
    { queryKey: ({ response }) => keys.tasks.detail(response.task.id), getData: (response) => response.task },
  ]
}
export function upsertList<T extends Organization | Project | Task>(previous: unknown, resource: T): T[] {
  const current = (previous as T[] | undefined) ?? []
  return [...current.filter((item) => item.id !== resource.id), resource]
}
