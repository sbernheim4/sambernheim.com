import type { QueryClient } from '@tanstack/react-query'
import type {
  SaveFlowConfig,
  RefetchPolicy,
  SaveSuccessContext,
} from '../types.ts'
import type {
  AnyParticipant,
  OrchestrationResult,
  OrchestratorConfig,
} from './contracts.ts'
import { createParticipant } from './participant.ts'
import { runRefetchPolicy } from '../query/effects.ts'

export function adaptFlow<V, C>(
  queryClient: QueryClient,
  config: SaveFlowConfig<V, C>,
  values: V,
) {
  if (
    (config.afterEffects && (config.onSuccess || config.onFailure)) ||
    config.steps.some((step) => step.afterEffects && step.onSuccess)
  )
    throw new Error('Use outcome callbacks or legacy afterEffects, not both.')
  const snapshot = structuredClone(values)
  const initial = config.buildInitialContext(snapshot)
  const steps = config.steps.map((step) => ({
    ...step,
    cacheUpdates: step.cacheUpdates?.map((target) => ({ ...target })),
    afterEffects: step.afterEffects?.slice(),
  }))
  const forms: AnyParticipant[] = []
  const saved: Record<string, { response: any; variables: any }> =
    Object.create(null)
  function contextThrough(index: number): C {
    let context = structuredClone(initial)
    for (const step of steps.slice(0, index + 1)) {
      const result = saved[step.id]
      if (result)
        context =
          step.assign?.(context, result.response, result.variables) ?? context
    }
    return context
  }
  for (const [index, step] of steps.entries()) {
    let flowContext: C
    forms.push(
      createParticipant<
        string,
        V,
        (input: any) => Promise<any>,
        AnyParticipant[]
      >({
        id: step.id,
        dependencies: forms.slice(),
        snapshot: () => snapshot,
        validate: () => ({ valid: true }),
        toMutationPayload: (values: V) => {
          flowContext = contextThrough(index - 1)
          return step.buildInput(flowContext, values)
        },
        endpoint: {
          mutationFn: async (input: any) => {
            const response = await step.mutationFn(input, flowContext)
            saved[step.id] = { response, variables: input }
            return response
          },
          refetchFunctions: [
            ...(step.refetchFunctions ?? []),
            ...legacyRefresh(step.refetchPolicy, () => ({
              queryClient,
              ...saved[step.id],
            })).refetchFunctions,
          ],
          invalidateQueryKeys: step.invalidateQueryKeys,
          cacheUpdates: step.cacheUpdates?.map((target) => ({
            queryKey: (context) =>
              typeof target.queryKey === 'function'
                ? target.queryKey(context)
                : target.queryKey,
            ...(target.update
              ? { update: target.update }
              : { getData: 'getData' in target ? target.getData : undefined }),
          })),
        },
        onSuccess: async (context) => {
          const outcome = { ...context, flowContext: contextThrough(index) }
          if (step.onSuccess) await step.onSuccess(outcome)
          else
            for (const effect of step.afterEffects ?? []) await effect(outcome)
        },
      }),
    )
  }
  const adapted: OrchestratorConfig<readonly AnyParticipant[]> = {
    forms,
    refetchFunctions: [
      ...(config.refetchFunctions ?? []),
      ...legacyRefresh(config.refetchPolicy, () => ({
        queryClient,
        response: contextThrough(steps.length - 1),
        variables: snapshot,
      })).refetchFunctions,
    ],
    invalidateQueryKeys: config.invalidateQueryKeys,
    onSuccess: async () => {
      const context = {
        queryClient,
        values: snapshot,
        flowContext: contextThrough(steps.length - 1),
      }
      if (config.onSuccess) await config.onSuccess(context)
      else for (const effect of config.afterEffects ?? []) await effect(context)
    },
    onFailure: async ({ result }) => {
      const flowContext = contextThrough(steps.length - 1)
      const error = Object.values(result.participants).find(
        (state) => state.failure,
      )?.failure?.error
      try {
        if (config.onFailure)
          await config.onFailure({ error, flowContext, result })
        else await config.onPartialFailure?.(error, flowContext)
      } finally {
        // Explicit compensation remains confined to the legacy flow adapter.
        for (const step of [...steps].reverse()) {
          if (!saved[step.id] || !step.compensate) continue
          try {
            await step.compensate(flowContext)
          } catch (error) {
            result.followUpErrors.push({
              phase: 'effect',
              participantId: step.id,
              error,
            })
          }
        }
      }
    },
  }
  return { config: adapted, getContext: () => contextThrough(steps.length - 1) }
}
function legacyRefresh<R, I>(
  policy: RefetchPolicy<R, I> | undefined,
  getContext: () => SaveSuccessContext<R, I>,
) {
  return {
    refetchFunctions: policy
      ? [() => runRefetchPolicy(getContext(), policy)]
      : [],
  }
}
export class FlowSaveError<C> extends Error {
  readonly result: OrchestrationResult<readonly AnyParticipant[]>
  readonly flowContext: C
  constructor(
    result: OrchestrationResult<readonly AnyParticipant[]>,
    context: C,
  ) {
    super(
      'The flow stopped. Previously saved resources remain recorded in the result.',
    )
    this.result = result
    this.flowContext = context
  }
}
