import { reconcileWorkspaceRead } from '../cache'
import { useQuery } from '@tanstack/react-query'
import { fetchBootstrap } from '../api'
import { bootstrapKey } from '../queries'

export function useWorkspaceResources() {
  return useQuery({ structuralSharing: reconcileWorkspaceRead, queryKey: bootstrapKey, queryFn: fetchBootstrap, staleTime: 5_000 })
}

import * as api from '../api'
import { workspaceKeys as keys } from '../queries'
export const useOrganizations = () => useQuery({ structuralSharing: reconcileWorkspaceRead, queryKey: keys.organizations.list(), queryFn: api.fetchOrganizations })
export const useOrganization = (id: string) => useQuery({ structuralSharing: reconcileWorkspaceRead, queryKey: keys.organizations.detail(id), queryFn: () => api.fetchOrganization(id), enabled: !!id })
export const useProjects = () => useQuery({ structuralSharing: reconcileWorkspaceRead, queryKey: keys.projects.list(), queryFn: api.fetchProjects })
export const useOrganizationProjects = (id: string) => useQuery({ structuralSharing: reconcileWorkspaceRead, queryKey: keys.projects.forOrganization(id), queryFn: () => api.fetchOrganizationProjects(id), enabled: !!id })
export const useProject = (id: string) => useQuery({ structuralSharing: reconcileWorkspaceRead, queryKey: keys.projects.detail(id), queryFn: () => api.fetchProject(id), enabled: !!id })
export const useTasks = () => useQuery({ structuralSharing: reconcileWorkspaceRead, queryKey: keys.tasks.list(), queryFn: api.fetchTasks })
export const useProjectTasks = (id: string) => useQuery({ structuralSharing: reconcileWorkspaceRead, queryKey: keys.tasks.forProject(id), queryFn: () => api.fetchProjectTasks(id), enabled: !!id })
export const useTask = (id: string) => useQuery({ structuralSharing: reconcileWorkspaceRead, queryKey: keys.tasks.detail(id), queryFn: () => api.fetchTask(id), enabled: !!id })

// Page-level read composition keeps resource ownership in domain queries.
export function useOrganizationsWorkspace() {
  const organizations = useOrganizations(); const projects = useProjects()
  return workspaceRead([organizations, projects], { organizations: organizations.data ?? [], projects: projects.data ?? [], tasks: [] })
}
export function useOrganizationWorkspace(id: string) {
  const organization = useOrganization(id); const projects = useOrganizationProjects(id); const tasks = useTasks()
  return workspaceRead([organization, projects, tasks], { organizations: organization.data ? [organization.data] : [], projects: projects.data ?? [], tasks: tasks.data ?? [] })
}
export function useProjectWorkspace(id: string) {
  const project = useProject(id); const organization = useOrganization(project.data?.organizationId ?? ''); const tasks = useProjectTasks(id)
  return workspaceRead(project.data ? [project, organization, tasks] : [project], { organizations: organization.data ? [organization.data] : [], projects: project.data ? [project.data] : [], tasks: tasks.data ?? [] })
}
export function useTaskWorkspace(id: string) {
  const task = useTask(id); const project = useProject(task.data?.projectId ?? ''); const organization = useOrganization(task.data?.organizationId ?? '')
  return workspaceRead(task.data ? [task, project, organization] : [task], { organizations: organization.data ? [organization.data] : [], projects: project.data ? [project.data] : [], tasks: task.data ? [task.data] : [] })
}
function workspaceRead(queries: Array<{ isPending: boolean; isError: boolean; refetch: () => unknown }>, data: import('../types').BootstrapData) {
  return { data, isPending: queries.some((q) => q.isPending), isError: queries.some((q) => q.isError), refetch: () => Promise.allSettled(queries.map((q) => q.refetch())) }
}

export const useOrganizationProfile = (id: string) => useQuery({ structuralSharing: reconcileWorkspaceRead, queryKey: keys.organizationProfiles.detail(id), queryFn: () => api.fetchOrganizationProfile(id), enabled: !!id })
export const useOrganizationOperations = (id: string) => useQuery({ structuralSharing: reconcileWorkspaceRead, queryKey: keys.organizationOperations.detail(id), queryFn: () => api.fetchOrganizationOperations(id), enabled: !!id })
