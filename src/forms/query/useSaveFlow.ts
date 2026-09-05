import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SaveFlowConfig, FlowStep } from '../types'
import { createCacheReconciliation } from './cacheReconciliation'
import { runRefetchPolicy, applyCacheUpdates, runAfterEffects } from './effects'

export function useSaveFlow<TFlowValues, TContext>(
  config: SaveFlowConfig<TFlowValues, TContext>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: config.mutationKey,
    mutationFn: async (values: TFlowValues) => {
      let flowContext = config.buildInitialContext(values)
      const reconcile = createCacheReconciliation()
      const completed: Array<FlowStep<TFlowValues, any, any, TContext>> =
        []

      try {
        for (const step of config.steps) {
          const input = step.buildInput(flowContext, values)
          const response = await step.mutationFn(input, flowContext)
          const context = { queryClient, response, variables: input }

          await reconcile(
            () => runRefetchPolicy(context, step.refetchPolicy),
            () => applyCacheUpdates(context, step.cacheUpdates),
          )

          flowContext =
            step.assign?.(flowContext, response, input) ?? flowContext

          await runAfterEffects(
            { ...context, flowContext },
            step.afterEffects,
          )
          completed.push(step)
        }

        await reconcile(
          () => runRefetchPolicy(
            { queryClient, response: flowContext, variables: values },
            config.refetchPolicy,
          ),
          () => {},
        )

        await runAfterEffects(
          { queryClient, values, flowContext },
          config.afterEffects,
        )

        return flowContext
      } catch (error) {
        await config.onPartialFailure?.(error, flowContext)

        for (const step of completed.reverse()) {
          await step.compensate?.(flowContext)
        }

        throw error
      }
    },
  })
}
