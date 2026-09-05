import { useQuery } from '@tanstack/react-query'
import { fetchBootstrap } from '../api'
import { bootstrapKey } from '../queries'

export function useWorkspaceResources() {
  return useQuery({ queryKey: bootstrapKey, queryFn: fetchBootstrap, staleTime: 5_000 })
}

import * as api from '../api'
import { workspaceKeys as keys } from '../queries'
export const useOrganizations = () => useQuery({ queryKey: keys.organizations.list(), queryFn: api.fetchOrganizations })
export const useOrganization = (id: string) => useQuery({ queryKey: keys.organizations.detail(id), queryFn: () => api.fetchOrganization(id), enabled: !!id })
export const useProjects = () => useQuery({ queryKey: keys.projects.list(), queryFn: api.fetchProjects })
export const useOrganizationProjects = (id: string) => useQuery({ queryKey: keys.projects.forOrganization(id), queryFn: () => api.fetchOrganizationProjects(id), enabled: !!id })
export const useProject = (id: string) => useQuery({ queryKey: keys.projects.detail(id), queryFn: () => api.fetchProject(id), enabled: !!id })
export const useTasks = () => useQuery({ queryKey: keys.tasks.list(), queryFn: api.fetchTasks })
export const useProjectTasks = (id: string) => useQuery({ queryKey: keys.tasks.forProject(id), queryFn: () => api.fetchProjectTasks(id), enabled: !!id })
export const useTask = (id: string) => useQuery({ queryKey: keys.tasks.detail(id), queryFn: () => api.fetchTask(id), enabled: !!id })
