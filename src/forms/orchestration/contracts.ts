import type { QueryClient, QueryKey } from '@tanstack/react-query'

export type AsyncMutation = (variables: any, ...options: any[]) => Promise<any>
export type Input<M extends AsyncMutation> = Parameters<M>[0]
export type Response<M extends AsyncMutation> = Awaited<ReturnType<M>>
export type RefreshOptions = {
  refetchFunctions?: readonly (() => unknown)[]
  invalidateQueryKeys?: readonly QueryKey[]
}
export type RetryPolicy = {
  maxRetries?: number
  delayMs?: number | ((attempt: number, error: unknown) => number)
  shouldRetry?: (error: unknown) => boolean
}
export type CacheContext<R, I, Results = {}> = {
  response: R
  variables: I
  results: Results
  queryClient: QueryClient
}
export type CacheTarget<R, I, Data = R, Results = {}> = {
  queryKey: (context: CacheContext<R, I, Results>) => QueryKey
} & ([R] extends [Data]
  ? { getData?: (response: R) => Data; update?: never }
  : { getData: (response: R) => Data; update?: never })
export type CacheUpdate<R, I, Results = {}> =
  | {
      queryKey: (context: CacheContext<R, I, Results>) => QueryKey
      getData?: (response: R) => unknown
      update?: never
    }
  | {
      queryKey: (context: CacheContext<R, I, Results>) => QueryKey
      getData?: never
      update: (
        previous: unknown,
        context: CacheContext<R, I, Results>,
      ) => unknown
    }
export type FollowUpError = {
  phase: 'refresh' | 'cache' | 'baseline' | 'effect'
  participantId?: string
  error: unknown
}
export type FailureContext<V, I> = {
  participantId: string
  formValues: V
  variables?: I
  attempts: number
  phase: 'validation' | 'mapping' | 'save'
  error: unknown
}
export type SuccessContext<V, I, R, Results = {}> = CacheContext<
  R,
  I,
  Results
> & {
  participantId: string
  formValues: V
  attempts: number
  followUpErrors: readonly FollowUpError[]
}
export type OutcomeCallbacks<V, I, R, Results = {}> = {
  onSuccess?: (
    context: SuccessContext<V, I, R, Results>,
  ) => void | Promise<void>
  onFailure?: (context: FailureContext<V, I>) => void | Promise<void>
}
export type Endpoint<M extends AsyncMutation, Results = {}> = RefreshOptions & {
  mutationFn: M
  cacheUpdates?: readonly CacheUpdate<
    Response<NoInfer<M>>,
    Input<NoInfer<M>>,
    Results
  >[]
  /** Only idempotent operations may opt into automatic retries. */
  retrySafe?: boolean
}
export type ValidationResult =
  { valid: true } | { valid: false; error: unknown }
export type PayloadMapping<V, I, Results> = [V] extends [I]
  ? { toMutationPayload?: (values: V, context: { results: Results }) => I }
  : { toMutationPayload: (values: V, context: { results: Results }) => I }

export const participantDefinition = Symbol('form participant')
export type AnyParticipant = Participant<string, any, any, any>
export type ResponsesOf<P extends readonly AnyParticipant[]> = {
  [F in P[number] as F['id']]: F extends Participant<string, any, any, infer R>
    ? R
    : never
}
export type Participant<Id extends string, V, I, R> = {
  readonly id: Id
  /** Internal adapter; no UI or FormApi is exposed by a participant. */
  readonly [participantDefinition]: RuntimeParticipant
  readonly types?: { values: V; input: I; response: R }
}
export type ParticipantConfig<
  Id extends string,
  V,
  M extends AsyncMutation,
  D extends readonly AnyParticipant[] = readonly [],
> = OutcomeCallbacks<
  V,
  Input<NoInfer<M>>,
  Response<NoInfer<M>>,
  Partial<ResponsesOf<D>>
> &
  PayloadMapping<V, Input<NoInfer<M>>, Partial<ResponsesOf<D>>> & {
    id: Id
    dependencies?: D
    snapshot: () => V
    validate: (values: V) => ValidationResult | Promise<ValidationResult>
    finish?: () => void
    acceptBaseline?: (values: V) => void | Promise<void>
    endpoint: Endpoint<M, Partial<ResponsesOf<D>>>
    retry?: RetryPolicy
  }

// Heterogeneous execution is erased only inside the adapter, after inference.
export type RuntimeParticipant = {
  id: string
  dependencies: readonly string[]
  snapshot: () => any
  validate: (values: any) => ValidationResult | Promise<ValidationResult>
  map: (values: any, context: { results: any }) => any
  finish?: () => void
  acceptBaseline?: (values: any) => void | Promise<void>
  endpoint: Endpoint<AsyncMutation, any>
  retry?: RetryPolicy
} & OutcomeCallbacks<any, any, any, any>

export type ParticipantState<V = unknown, I = unknown, R = unknown> = {
  participantId: string
  status:
    | 'pending'
    | 'validating'
    | 'invalid'
    | 'ready'
    | 'saving'
    | 'retrying'
    | 'saved'
    | 'failed'
    | 'skipped'
  attempts: number
  formValues?: V
  variables?: I
  response?: R
  failure?: FailureContext<V, I>
}
export type OrchestrationResult<P extends readonly AnyParticipant[]> = {
  outcome:
    | 'validation-failed'
    | 'success'
    | 'partial-failure'
    | 'saved-with-follow-up-errors'
  participants: {
    [F in P[number] as F['id']]: F extends Participant<
      string,
      infer V,
      infer I,
      infer R
    >
      ? ParticipantState<V, I, R>
      : never
  }
  responses: Partial<ResponsesOf<P>>
  followUpErrors: FollowUpError[]
}
export type Phase =
  | 'idle'
  | 'validating'
  | 'saving'
  | 'refreshing'
  | 'reconciling'
  | 'effects'
  | 'complete'
export type OrchestratorConfig<P extends readonly AnyParticipant[]> =
  RefreshOptions & {
    forms: P
    retry?: RetryPolicy
    cacheUpdates?: readonly CacheUpdate<
      Partial<ResponsesOf<P>>,
      undefined,
      Partial<ResponsesOf<P>>
    >[]
    onSuccess?: (context: {
      result: OrchestrationResult<P>
    }) => void | Promise<void>
    onFailure?: (context: {
      result: OrchestrationResult<P>
    }) => void | Promise<void>
  }
