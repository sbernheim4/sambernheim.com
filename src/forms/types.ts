import type { RefreshOptions, OrchestrationResult, AnyParticipant, CacheUpdate as ModernCacheUpdate } from './orchestration/contracts'
import type { QueryClient, QueryKey } from '@tanstack/react-query'

export type AfterEffect<TContext> = (context: TContext) => void | Promise<void>

export type CacheUpdate<TResponse, TVariables> = {
  queryKey:
    | QueryKey
    | ((context: SaveSuccessContext<TResponse, TVariables>) => QueryKey)
  update: (
    previous: unknown,
    context: SaveSuccessContext<TResponse, TVariables>,
  ) => unknown
}

export type RefetchPolicy<TResponse, TVariables> = {
  invalidate?:
    | QueryKey[]
    | ((context: SaveSuccessContext<TResponse, TVariables>) => QueryKey[])
  refetchQueries?:
    | QueryKey[]
    | ((context: SaveSuccessContext<TResponse, TVariables>) => QueryKey[])
  refetchFns?: Array<
    (context: SaveSuccessContext<TResponse, TVariables>) => Promise<unknown>
  >
}

export type SaveSuccessContext<TResponse, TVariables> = {
  queryClient: QueryClient
  response: TResponse
  variables: TVariables
}

export type SaveEndpointConfig<TVariables, TResponse> = {
  mutationKey?: QueryKey
  mutationFn: (variables: TVariables) => Promise<TResponse>
  refetchPolicy?: RefetchPolicy<TResponse, TVariables>
  cacheUpdates?: CacheUpdate<TResponse, TVariables>[]
  afterEffects?: AfterEffect<SaveSuccessContext<TResponse, TVariables>>[]
}

export type EndpointFormConfig<TValues, TResponse> = {
  defaultValues: TValues
  endpoint: SaveEndpointConfig<TValues, TResponse>
  afterEffects?: AfterEffect<SaveSuccessContext<TResponse, TValues>>[]
}

export type FlowStep<TFlowValues, TInput, TResponse, TContext> = RefreshOptions & {
  onSuccess?: AfterEffect<FlowStepSuccessContext<TResponse, TInput, TContext>>
  id: string
  buildInput: (context: TContext, values: TFlowValues) => TInput
  mutationFn: (input: TInput, context: TContext) => Promise<TResponse>
  refetchPolicy?: RefetchPolicy<TResponse, TInput>
  cacheUpdates?: Array<CacheUpdate<TResponse, TInput> | ModernCacheUpdate<TResponse, TInput>>
  assign?: (context: TContext, response: TResponse, input: TInput) => TContext
  afterEffects?: AfterEffect<FlowStepSuccessContext<TResponse, TInput, TContext>>[]
  compensate?: (context: TContext) => Promise<void>
}

export type FlowStepSuccessContext<TResponse, TInput, TContext> =
  SaveSuccessContext<TResponse, TInput> & {
    flowContext: TContext
  }

export type SaveFlowConfig<TFlowValues, TContext> = RefreshOptions & {
  onSuccess?: AfterEffect<{ queryClient: QueryClient; values: TFlowValues; flowContext: TContext }>
  onFailure?: AfterEffect<{ error: unknown; flowContext: TContext; result: OrchestrationResult<readonly AnyParticipant[]> }>
  mutationKey?: QueryKey
  buildInitialContext: (values: TFlowValues) => TContext
  steps: Array<FlowStep<TFlowValues, any, any, TContext>>
  refetchPolicy?: RefetchPolicy<TContext, TFlowValues>
  afterEffects?: AfterEffect<{
    queryClient: QueryClient
    values: TFlowValues
    flowContext: TContext
  }>[]
  onPartialFailure?: (error: unknown, context: TContext) => void | Promise<void>
}

export type FlowFormConfig<TFlowValues, TContext> = {
  defaultValues: TFlowValues
  onSuccess?: SaveFlowConfig<TFlowValues, TContext>['onSuccess']
  flow: SaveFlowConfig<TFlowValues, TContext>
  afterEffects?: SaveFlowConfig<TFlowValues, TContext>['afterEffects']
}
