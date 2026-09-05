import type { EndpointFormConfig } from '../types'
import { useSaveEndpoint } from '../query/useSaveEndpoint'
import { useAppForm } from './useAppForm'

export function useEndpointForm<TValues, TResponse>(
  config: EndpointFormConfig<TValues, TResponse>,
) {
  const endpoint = useSaveEndpoint({
    ...config.endpoint,
    afterEffects: [
      ...(config.endpoint.afterEffects ?? []),
      ...(config.afterEffects ?? []),
    ],
  })

  const form = useAppForm({
    defaultValues: config.defaultValues,
    onSubmit: async ({ value }) => {
      await endpoint.mutateAsync(value)
    },
  })

  return {
    form,
    endpoint,
    isSaving: endpoint.isPending,
    error: endpoint.error,
  }
}

export function useQueryBackedForm<TValues, TResponse>(
  config: EndpointFormConfig<TValues, TResponse>,
) {
  return useEndpointForm(config)
}
