import type { QueryClient } from '@tanstack/react-query'
import type { CacheContext, CacheUpdate, FollowUpError, RefreshOptions } from './contracts.ts'

export async function settleRefreshes(queryClient: QueryClient, sources: readonly (RefreshOptions & { participantId?: string })[]): Promise<FollowUpError[]> {
  const jobs = sources.flatMap((source) => [
    ...(source.invalidateQueryKeys ?? []).map((queryKey) => ({
      participantId: source.participantId,
      run: () => queryClient.invalidateQueries({ queryKey }, { cancelRefetch: false, throwOnError: true }),
    })),
    ...(source.refetchFunctions ?? []).map((run) => ({ participantId: source.participantId, run })),
  ])
  const settled = await Promise.allSettled(jobs.map(async ({ run }) => {
    const value = await run()
    // Query-hook refetch methods resolve error results unless throwOnError is set.
    if (value && typeof value === 'object' && 'isError' in value && value.isError && 'error' in value) throw value.error
  }))
  return settled.flatMap((entry, index) => entry.status === 'rejected'
    ? [{ phase: 'refresh' as const, participantId: jobs[index].participantId, error: entry.reason }] : [])
}

export function reconcileTargets<R, I, Results>(context: CacheContext<R, I, Results>, targets: readonly CacheUpdate<R, I, Results>[] = [], participantId?: string): FollowUpError[] {
  const errors: FollowUpError[] = []
  for (const target of targets) {
    try {
      const key = target.queryKey(context)
      if (target.update) context.queryClient.setQueryData(key, (previous: unknown) => target.update!(previous, context))
      else {
        const data = target.getData ? target.getData(context.response) : context.response
        context.queryClient.setQueryData(key, () => data)
      }
    } catch (error) { errors.push({ phase: 'cache', participantId, error }) }
  }
  return errors
}
