import type { QueryKey } from '@tanstack/react-query'
import type { AfterEffect, CacheUpdate, RefetchPolicy, SaveSuccessContext } from '../types'

export async function runRefetchPolicy<TResponse, TVariables>(
  context: SaveSuccessContext<TResponse, TVariables>,
  policy: RefetchPolicy<TResponse, TVariables> | undefined,
) {
  const invalidations = resolve(policy?.invalidate, context)
  const queryRefetches = resolve(policy?.refetchQueries, context)

  const results = await Promise.allSettled([
    ...invalidations.map((queryKey) =>
      context.queryClient.invalidateQueries({ queryKey }),
    ),
    ...queryRefetches.map((queryKey) =>
      context.queryClient.refetchQueries({ queryKey, type: 'active' }),
    ),
    ...(policy?.refetchFns ?? []).map(async (refetch) => refetch(context)),
  ])
  const failure = results.find((result) => result.status === 'rejected')
  if (failure?.status === 'rejected') throw failure.reason
}

export function applyCacheUpdates<TResponse, TVariables>(
  context: SaveSuccessContext<TResponse, TVariables>,
  cacheUpdates: CacheUpdate<TResponse, TVariables>[] | undefined,
) {
  for (const cacheUpdate of cacheUpdates ?? []) {
    const queryKey =
      typeof cacheUpdate.queryKey === 'function'
        ? cacheUpdate.queryKey(context)
        : cacheUpdate.queryKey

    context.queryClient.setQueryData(queryKey, (previous) =>
      cacheUpdate.update(previous, context),
    )
  }
}

export async function runAfterEffects<TContext>(
  context: TContext,
  afterEffects: AfterEffect<TContext>[] | undefined,
) {
  for (const afterEffect of afterEffects ?? []) {
    await afterEffect(context)
  }
}

function resolve<TContext>(
  value: QueryKey[] | ((context: TContext) => QueryKey[]) | undefined,
  context: TContext,
) {
  return typeof value === 'function' ? value(context) : (value ?? [])
}
