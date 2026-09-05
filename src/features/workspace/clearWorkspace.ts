import type { QueryClient } from '@tanstack/react-query'
import type { BootstrapData } from './types'
import { bootstrapKey, workspaceKeys } from './queries.ts'
import { lifecycleCoordinator } from '../../forms/orchestration/coordinator.ts'

export async function clearWorkspace(queryClient: QueryClient, request: () => Promise<BootstrapData>) {
  if (queryClient.isMutating()) return false
  const release = lifecycleCoordinator(queryClient).beginClear()
  if (!release) return false
  try {
    const data = await request()
    await queryClient.cancelQueries({ queryKey: workspaceKeys.all })
    queryClient.removeQueries({ queryKey: workspaceKeys.all })
    queryClient.setQueryData(bootstrapKey, data)
    queryClient.setQueryData(workspaceKeys.organizations.list(), data.organizations)
    queryClient.setQueryData(workspaceKeys.projects.list(), data.projects)
    queryClient.setQueryData(workspaceKeys.tasks.list(), data.tasks)
    return true
  } finally { release() }
}
