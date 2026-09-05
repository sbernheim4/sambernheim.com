import { useQueryClient } from '@tanstack/react-query'
import type { EndpointFormConfig } from '../types'
import type { AsyncMutation, Input, Response } from '../orchestration/contracts'
import { useFormOrchestrator } from '../query/useFormOrchestrator'
import { useComposableForm, type ComposableFormConfig, type QuerySource } from './useComposableForm'
import { legacyFormConfig } from './legacyFormConfig'

type CrudConfig<Q, V, M extends AsyncMutation> = Omit<ComposableFormConfig<'resource', Q, V, M>, 'id'>
type Binding<V, M extends AsyncMutation> = ReturnType<typeof useComposableForm<'resource', V, M>>
type CrudReturn<V, M extends AsyncMutation> = Binding<V, M> & {
  save: ReturnType<typeof useFormOrchestrator<readonly [Binding<V, M>['participant']]>>
  endpoint: { mutateAsync: (values?: Input<M>) => Promise<Response<M> | undefined>; isPending: boolean; error: Error | null }
  submit: () => ReturnType<ReturnType<typeof useFormOrchestrator<readonly [Binding<V, M>['participant']]>>['submit']>
  isSaving: boolean
  error: Error | null
}

export function useQueryBackedForm<Q, F extends (data: Q) => any, M extends AsyncMutation>(config: Omit<CrudConfig<Q, NoInfer<ReturnType<F>>, M>, 'toFormData'> & { query?: QuerySource<Q>; toFormData: F }): CrudReturn<ReturnType<F>, M>
export function useQueryBackedForm<V, M extends AsyncMutation>(config: CrudConfig<V, V, M> & { toFormData?: never }): CrudReturn<V, M>
/** @deprecated Default-values compatibility for the original endpoint API. */
export function useQueryBackedForm<V, R>(config: EndpointFormConfig<V, R>): CrudReturn<V, (values: V) => Promise<R>>
export function useQueryBackedForm(config: any): any {
  const normalized = legacyFormConfig({ ...config, queryClient: useQueryClient() })
  const binding = useComposableForm({ ...normalized, id: 'resource' })
  const save = useFormOrchestrator({ forms: [binding.participant] })
  const submit = save.submit
  // handleSubmit enters the same executor directly; validation belongs to the
  // snapshot adapter, avoiding TanStack's resolved-without-writing ambiguity.
  binding.form.handleSubmit = async () => { await submit() }
  const failure = save.result?.participants.resource?.failure?.error ?? binding.readError
  const error = failure == null ? null : failure instanceof Error ? failure : new Error(String(failure))
  return { ...binding, save, submit, isSaving: save.isSaving, error,
    endpoint: { isPending: save.isSaving, error, mutateAsync: async () => (await submit()).responses.resource },
  }
}
export const useEndpointForm = useQueryBackedForm
