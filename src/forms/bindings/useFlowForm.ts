import { useMemo } from 'react'
import type { FlowFormConfig } from '../types'
import { useSaveFlow } from '../query/useSaveFlow'
import { useAppForm } from './useAppForm'

export function useFlowForm<TFlowValues, TContext>(
  config: FlowFormConfig<TFlowValues, TContext>,
) {
  const flowConfig = useMemo(
    () => ({
      ...config.flow,
      afterEffects: [
        ...(config.flow.afterEffects ?? []),
        ...(config.afterEffects ?? []),
      ],
    }),
    [config],
  )
  const flow = useSaveFlow(flowConfig)
  const form = useAppForm({
    defaultValues: config.defaultValues,
    onSubmit: async ({ value }) => {
      await flow.mutateAsync(value)
    },
  })

  return {
    form,
    flow,
    isSaving: flow.isPending,
    error: flow.error,
  }
}
