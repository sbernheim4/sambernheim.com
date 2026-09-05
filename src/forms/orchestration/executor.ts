import type { QueryClient } from '@tanstack/react-query'
import { participantDefinition } from './contracts.ts'
import type { AnyParticipant, OrchestratorConfig, OrchestrationResult, ParticipantState, Phase, RuntimeParticipant } from './contracts.ts'
import { reconcileTargets, settleRefreshes } from './lifecycle.ts'
import { lifecycleCoordinator } from './coordinator.ts'

export type ExecutionState<P extends readonly AnyParticipant[]> = { phase: Phase; isSaving: boolean; result?: OrchestrationResult<P> }
export function isTransientError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  if ('status' in error && typeof error.status === 'number') return error.status === 408 || error.status === 429 || error.status >= 500
  return error instanceof TypeError // fetch network failures; only used by retry-safe endpoints
}

export function createOrchestrator<P extends readonly AnyParticipant[]>(queryClient: QueryClient, onChange: (state: ExecutionState<P>) => void = () => {}) {
  let active: Promise<OrchestrationResult<P>> | undefined
  return {
    submit(config: OrchestratorConfig<P>): Promise<OrchestrationResult<P>> {
      if (active) return active
      // Capture definitions/callbacks at submission, never read a React ref during a run.
      const captured = { ...config, forms: config.forms.slice(), retry: config.retry && { ...config.retry },
        refetchFunctions: config.refetchFunctions?.slice(), invalidateQueryKeys: config.invalidateQueryKeys?.map((key) => [...key]), cacheUpdates: config.cacheUpdates?.map((target) => ({ ...target })) }
      const forms = captured.forms.map((form) => form[participantDefinition])
      const seen = new Set<string>()
      for (const form of forms) {
        if (seen.has(form.id)) return Promise.reject(new Error(`Duplicate participant ID: ${form.id}`))
        if (form.dependencies.some((id) => !seen.has(id))) return Promise.reject(new Error(`Dependencies for ${form.id} must precede it.`))
        seen.add(form.id)
      }
      let release: () => void
      try { release = lifecycleCoordinator(queryClient).begin() } catch (error) { return Promise.reject(error) }
      active = run(captured as unknown as OrchestratorConfig<P>, forms).finally(() => { active = undefined; release() })
      return active
    },
    reset() {
      if (active) return false
      onChange({ phase: 'idle', isSaving: false })
      return true
    },
  }

  async function run(config: OrchestratorConfig<P>, forms: RuntimeParticipant[]): Promise<OrchestrationResult<P>> {
    const states: Record<string, ParticipantState<any, any, any>> = Object.create(null)
    const responses: Record<string, any> = Object.create(null)
    const result = { outcome: 'validation-failed', participants: states, responses, followUpErrors: [] } as unknown as OrchestrationResult<P>
    const emit = (phase: Phase) => onChange({ phase, isSaving: phase !== 'complete', result: { ...result, participants: Object.fromEntries(Object.entries(states).map(([id, state]) => [id, { ...state }])) as OrchestrationResult<P>['participants'], responses: { ...responses } as OrchestrationResult<P>['responses'], followUpErrors: [...result.followUpErrors] } })
    const fail = (form: RuntimeParticipant, phase: 'validation' | 'mapping' | 'save', error: unknown) => {
      const state = states[form.id]
      state.status = phase === 'validation' ? 'invalid' : 'failed'
      state.failure = { participantId: form.id, phase, error, formValues: state.formValues, variables: state.variables, attempts: state.attempts }
    }
    // Snapshot every child before awaiting validation in any child.
    for (const form of forms) {
      states[form.id] = { participantId: form.id, status: 'validating', attempts: 0 }
      try { states[form.id].formValues = structuredClone(form.snapshot()) }
      catch (error) { fail(form, 'validation', error) }
    }
    emit('validating')
    await Promise.all(forms.map(async (form) => {
      if (states[form.id].failure) return
      try {
        const validation = await form.validate(structuredClone(states[form.id].formValues))
        if (!validation.valid) fail(form, 'validation', validation.error)
        else states[form.id].status = 'ready'
      } catch (error) { fail(form, 'validation', error) }
    }))
    if (!forms.some((form) => states[form.id].failure)) {
      // Independent mapping errors are discovered before issuing any request.
      for (const form of forms.filter((form) => !form.dependencies.length)) {
        try { states[form.id].variables = structuredClone(form.map(structuredClone(states[form.id].formValues), { results: {} })) }
        catch (error) { fail(form, 'mapping', error) }
      }
    }
    const preflightFailed = forms.some((form) => states[form.id].failure)
    if (!preflightFailed) {
      for (const form of forms) {
        const state = states[form.id]
        if (form.dependencies.length) {
          try { state.variables = structuredClone(form.map(structuredClone(state.formValues), { results: structuredClone(responses) })) }
          catch (error) { fail(form, 'mapping', error); break }
        }
        const retry = { maxRetries: 1, delayMs: 500, shouldRetry: isTransientError, ...config.retry, ...form.retry }
        while (true) {
          state.status = 'saving'; state.attempts++; emit('saving')
          try {
            const response = await form.endpoint.mutationFn(structuredClone(state.variables))
            // Persistence is recorded immediately, before any follow-up work.
            state.response = response; responses[form.id] = response; state.status = 'saved'
            break
          } catch (error) {
            let retryable = false
            try { retryable = !!form.endpoint.retrySafe && state.attempts <= retry.maxRetries && retry.shouldRetry(error) } catch { /* predicate errors must not hide the request error */ }
            if (!retryable) { fail(form, 'save', error); break }
            state.status = 'retrying'; emit('saving')
            let delay = 500
            try { delay = typeof retry.delayMs === 'function' ? retry.delayMs(state.attempts, error) : retry.delayMs } catch { fail(form, 'save', error); break }
            await new Promise((resolve) => setTimeout(resolve, Math.max(0, delay)))
          }
        }
        if (state.failure) break
      }
    }
    for (const state of Object.values(states)) if (state.status === 'ready') state.status = 'skipped'
    const successful = forms.filter((form) => states[form.id].status === 'saved')
    const allSaved = successful.length === forms.length
    result.outcome = preflightFailed ? 'validation-failed' : allSaved ? 'success' : 'partial-failure'
    const context = (form: RuntimeParticipant) => ({ queryClient, response: states[form.id].response, variables: states[form.id].variables, results: responses, formValues: states[form.id].formValues, participantId: form.id, attempts: states[form.id].attempts, followUpErrors: result.followUpErrors })
    if (!preflightFailed) {
      emit('refreshing')
      result.followUpErrors.push(...await settleRefreshes(queryClient, [...successful.map((form) => ({ ...form.endpoint, participantId: form.id })), config]))
      emit('reconciling')
      for (const form of successful) result.followUpErrors.push(...reconcileTargets(context(form), form.endpoint.cacheUpdates, form.id))
      result.followUpErrors.push(...reconcileTargets({ queryClient, response: result.responses, variables: undefined, results: result.responses }, config.cacheUpdates))
      for (const form of successful) {
        try { await form.acceptBaseline?.(structuredClone(states[form.id].formValues)) }
        catch (error) { result.followUpErrors.push({ phase: 'baseline', participantId: form.id, error }) }
      }
    }
    emit('effects')
    for (const form of forms) {
      try {
        if (states[form.id].status === 'saved') await form.onSuccess?.(context(form))
        else if (states[form.id].failure) await form.onFailure?.(states[form.id].failure!)
      } catch (error) { result.followUpErrors.push({ phase: 'effect', participantId: form.id, error }) }
    }
    if (allSaved && result.followUpErrors.length) result.outcome = 'saved-with-follow-up-errors'
    try { await (allSaved ? config.onSuccess : config.onFailure)?.({ result }) }
    catch (error) { result.followUpErrors.push({ phase: 'effect', error }) }
    if (allSaved && result.followUpErrors.length) result.outcome = 'saved-with-follow-up-errors'
    emit('complete')
    return result
  }
}
