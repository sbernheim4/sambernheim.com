import { useEffect, useRef, useState } from 'react'
import { evaluate } from '@tanstack/form-core'
import type { AnyParticipant, AsyncMutation, ParticipantConfig } from '../orchestration/contracts'
import { createParticipant } from '../orchestration/participant'
import { useAppForm } from './useAppForm'
import { acceptSavedBaseline, validateSnapshot } from './formAdapter'

export type QuerySource<Q> = { data: Q | undefined; isPending: boolean; isError: boolean; error?: unknown }
type QueryMapping<Q, V> = { toFormData?: (data: Q) => V }
export type ComposableFormConfig<Id extends string, Q, V, M extends AsyncMutation, D extends readonly AnyParticipant[] = readonly []> =
  Omit<ParticipantConfig<Id, V, M, D>, 'snapshot' | 'validate' | 'acceptBaseline'> & QueryMapping<Q, V> & {
    query?: QuerySource<Q>
    defaultValues?: V
    /** Snapshot-level form validation, in addition to registered field validators. */
    validate?: (values: V) => string | undefined | Promise<string | undefined>
  }

type BindingReturn<Id extends string, V, M extends AsyncMutation> = ReturnType<typeof useComposableFormImpl<Id, V, V, M>>
export function useComposableForm<const Id extends string, Q, F extends (data: Q) => any, M extends AsyncMutation, const D extends readonly AnyParticipant[] = readonly []>(
  config: Omit<ComposableFormConfig<Id, Q, NoInfer<ReturnType<F>>, M, D>, 'toFormData'> & { query?: QuerySource<Q>; toFormData: F },
): BindingReturn<Id, ReturnType<F>, M>
export function useComposableForm<const Id extends string, V, M extends AsyncMutation, const D extends readonly AnyParticipant[] = readonly []>(
  config: ComposableFormConfig<Id, V, V, M, D> & { toFormData?: never },
): BindingReturn<Id, V, M>
export function useComposableForm(config: any): any { return useComposableFormImpl(config) }

function useComposableFormImpl<const Id extends string, Q, V = Q, M extends AsyncMutation = AsyncMutation, const D extends readonly AnyParticipant[] = readonly []>(
  config: ComposableFormConfig<Id, Q, V, M, D>,
) {
  const baseline = useRef<{ values: V; initialized: boolean }>(undefined)
  const [readError, setReadError] = useState<unknown>()
  if (!baseline.current) {
    let values = config.defaultValues as V
    let initialized = !config.query && config.defaultValues !== undefined
    if (config.query?.data !== undefined && !config.query.isError) {
      try { values = config.toFormData ? config.toFormData(config.query.data) : config.query.data as unknown as V; initialized = true } catch { /* surfaced by initialization effect */ }
    }
    baseline.current = { values, initialized }
  }
  const inFlight = useRef(false)
  const form = useAppForm({ defaultValues: baseline.current.values })
  const [, render] = useState(0)
  const lastData = useRef<unknown>(undefined)
  useEffect(() => {
    if (!config.query || config.query.data === undefined || config.query.isError || lastData.current === config.query.data) return
    lastData.current = config.query.data
    if (inFlight.current || (baseline.current!.initialized && !evaluate(form.state.values, baseline.current!.values))) return
    try {
      const values = config.toFormData ? config.toFormData(config.query.data) : config.query.data as unknown as V
      baseline.current = { values, initialized: true }
      form.reset(values); setReadError(undefined); render((n) => n + 1)
    } catch (error) { setReadError(error) }
  }, [config.query?.data, config.query?.isError, config.toFormData, form])
  const isReady = baseline.current.initialized && !readError && (!config.query || (!config.query.isPending && !config.query.isError && config.query.data !== undefined))
  const participant = createParticipant<Id, V, M, D>({
    ...config,
    finish: () => { inFlight.current = false },
    snapshot: () => {
      if (!isReady) throw readError ?? config.query?.error ?? new Error('Form data is not ready.')
      inFlight.current = true
      return form.state.values
    },
    validate: async (values: V) => {
      const fields = await validateSnapshot(form, values)
      const error = await config.validate?.(values)
      if (error) {
        if (evaluate(form.state.values, values)) form.setErrorMap({ onSubmit: { form: error, fields: {} } })
        return { valid: false as const, error: new Error(error) }
      }
      return fields
    },
    acceptBaseline: (values: V) => { baseline.current = { values, initialized: true }; acceptSavedBaseline(form, values) },
    onSuccess: async (context: Parameters<NonNullable<typeof config.onSuccess>>[0]) => { try { await config.onSuccess?.(context) } finally { inFlight.current = false } },
    onFailure: async (context: Parameters<NonNullable<typeof config.onFailure>>[0]) => { try { await config.onFailure?.(context) } finally { inFlight.current = false } },
  } as unknown as ParticipantConfig<Id, V, M, D>)
  // Skipped children also need their submission lock released.

  return { form, participant, isReady, readError: readError ?? config.query?.error }
}
