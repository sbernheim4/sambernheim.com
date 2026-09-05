import type { QueryClient } from '@tanstack/react-query'
import { runRefetchPolicy } from '../query/effects'

/** The only boundary accepting static cache keys, refetchPolicy and effect arrays. */
export function legacyFormConfig(config: any): any {
  const endpoint = config.endpoint
  const legacyEffects = [
    ...(endpoint.afterEffects ?? []),
    ...(config.afterEffects ?? []),
  ]
  if (
    (endpoint.afterEffects || config.afterEffects) &&
    (config.onSuccess ||
      config.onFailure ||
      endpoint.onSuccess ||
      endpoint.onFailure)
  ) {
    throw new Error('Use outcome callbacks or legacy afterEffects, not both.')
  }
  // Legacy refetch policies can depend on the response. Capture their context
  // on request completion, then execute them only in the shared refresh phase.
  let context: {
    response: unknown
    variables: unknown
    queryClient: QueryClient
  }
  return {
    ...config,
    endpoint: {
      ...endpoint,
      mutationFn: endpoint.refetchPolicy
        ? async (variables: unknown) => {
            const response = await endpoint.mutationFn(variables)
            context = { response, variables, queryClient: config.queryClient }
            return response
          }
        : endpoint.mutationFn,
      cacheUpdates: endpoint.cacheUpdates?.map((target: any) => ({
        ...target,
        queryKey:
          typeof target.queryKey === 'function'
            ? target.queryKey
            : () => target.queryKey,
      })),
      refetchFunctions: [
        ...(endpoint.refetchFunctions ?? []),
        ...(endpoint.refetchPolicy
          ? [() => runRefetchPolicy(context, endpoint.refetchPolicy)]
          : []),
      ],
    },
    onSuccess: legacyEffects.length
      ? async (ctx: unknown) => {
          for (const effect of legacyEffects) await effect(ctx)
        }
      : config.onSuccess,
  }
}
