import { useSyncExternalStore } from 'react'
import { useIsMutating, useQueryClient } from '@tanstack/react-query'
import { useClearWorkspaceMutation } from './mutations'
import { lifecycleCoordinator } from '../../../forms/orchestration/coordinator'
import { clearWorkspace } from '../clearWorkspace'

export function useClearEntities() {
  const queryClient = useQueryClient()
  const activeMutations = useIsMutating()
  const coordinator = lifecycleCoordinator(queryClient)
  const activeLifecycles = useSyncExternalStore(coordinator.subscribe, coordinator.getSnapshot, coordinator.getSnapshot)
  const mutation = useClearWorkspaceMutation()
  return { ...mutation, isDisabled: activeMutations > 0 || activeLifecycles > 0,
    clear: () => { void clearWorkspace(queryClient, mutation.mutateAsync).catch(() => {}) },
  }
}
