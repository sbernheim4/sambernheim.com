import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SaveEndpointConfig } from '../types'
import { createCacheReconciliation } from './cacheReconciliation'
import { runRefetchPolicy, applyCacheUpdates, runAfterEffects } from './effects'

export function useSaveEndpoint<TVariables, TResponse>(
  config: SaveEndpointConfig<TVariables, TResponse>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: config.mutationKey,
    mutationFn: config.mutationFn,
    onSuccess: async (response, variables) => {
      const context = { queryClient, response, variables }

      const reconcile = createCacheReconciliation()
      await reconcile(
        () => runRefetchPolicy(context, config.refetchPolicy),
        () => applyCacheUpdates(context, config.cacheUpdates),
      )
      await runAfterEffects(context, config.afterEffects)
    },
  })
}
