import type { QueryClient, QueryKey } from "@tanstack/react-query";

export type AsyncMutation = (variables: any, ...options: any[]) => Promise<any>;
export type Input<M extends AsyncMutation> = Parameters<M>[0];
export type Response<M extends AsyncMutation> = Awaited<ReturnType<M>>;
export type RefreshOptions = {
  refetchFunctions?: readonly (() => unknown)[];
  invalidateQueryKeys?: readonly QueryKey[];
};
export type RetryPolicy = {
  maxRetries?: number;
  delayMs?: number | ((attempt: number, error: unknown) => number);
  shouldRetry?: (error: unknown) => boolean;
};
export type CacheContext<R, I, Results = {}> = {
  response: R;
  variables: I;
  results: Results;
  queryClient: QueryClient;
};
export type CacheTarget<R, I, Data = R, Results = {}> = {
  queryKey: (context: CacheContext<R, I, Results>) => QueryKey;
} & ([R] extends [Data]
  ? { getData?: (response: R) => Data; update?: never }
  : { getData: (response: R) => Data; update?: never });
export type CacheUpdate<R, I, Results = {}> =
  | {
      queryKey: (context: CacheContext<R, I, Results>) => QueryKey;
      getData?: (response: R) => unknown;
      update?: never;
    }
  | {
      queryKey: (context: CacheContext<R, I, Results>) => QueryKey;
      getData?: never;
      update: (previous: unknown, context: CacheContext<R, I, Results>) => unknown;
    };
export type FollowUpError = {
  phase: "refresh" | "cache" | "baseline" | "effect";
  formId?: string;
  error: unknown;
};
export type FailureContext<V, I> = {
  formId: string;
  formValues: V;
  variables?: I;
  attempts: number;
  phase: "validation" | "mapping" | "save";
  error: unknown;
};
export type SuccessContext<V, I, R, Results = {}> = CacheContext<R, I, Results> & {
  formId: string;
  formValues: V;
  attempts: number;
  followUpErrors: readonly FollowUpError[];
};
export type OutcomeCallbacks<V, I, R, Results = {}> = {
  onSuccess?: (context: SuccessContext<V, I, R, Results>) => void | Promise<void>;
  onFailure?: (context: FailureContext<V, I>) => void | Promise<void>;
};
export type Endpoint<M extends AsyncMutation, Results = {}> = RefreshOptions & {
  mutationFn: M;
  cacheUpdates?: readonly CacheUpdate<Response<NoInfer<M>>, Input<NoInfer<M>>, Results>[];
  /** Only idempotent operations may opt into automatic retries. */
  retrySafe?: boolean;
};
export type ValidationResult = { valid: true } | { valid: false; error: unknown };
export type PayloadMapping<V, I, Results> = [V] extends [I]
  ? { toMutationPayload?: (values: V, context: { results: Results }) => I }
  : { toMutationPayload: (values: V, context: { results: Results }) => I };

/** Common shape consumed by the save loop; callbacks retain their types at declaration. */
export type AnyForm = {
  id: string;
  dependencies?: readonly { id: string }[];
  snapshot: () => any;
  validate: (...args: any[]) => ValidationResult | Promise<ValidationResult>;
  toMutationPayload?: (...args: any[]) => any;
  acceptBaseline?: (...args: any[]) => void | Promise<void>;
  finish?: () => void;
  onSuccess?: (...args: any[]) => void | Promise<void>;
  onFailure?: (...args: any[]) => void | Promise<void>;
  retry?: RetryPolicy;
  endpoint: RefreshOptions & {
    mutationFn: AsyncMutation;
    retrySafe?: boolean;
    cacheUpdates?: readonly ({ queryKey: (...args: any[]) => QueryKey } & (
      | { getData?: (...args: any[]) => unknown; update?: never }
      | { getData?: never; update: (...args: any[]) => unknown }
    ))[];
  };
};
export type ResponsesOf<F extends readonly AnyForm[]> = {
  [Form in F[number] as Form["id"]]: Response<Form["endpoint"]["mutationFn"]>;
};
export type FormConfig<
  Id extends string,
  V,
  M extends AsyncMutation,
  D extends readonly AnyForm[] = readonly [],
> = OutcomeCallbacks<V, Input<NoInfer<M>>, Response<NoInfer<M>>, Partial<ResponsesOf<D>>> &
  PayloadMapping<V, Input<NoInfer<M>>, Partial<ResponsesOf<D>>> & {
    id: Id;
    dependencies?: D;
    snapshot: () => V;
    validate: (values: V) => ValidationResult | Promise<ValidationResult>;
    acceptBaseline?: (values: V) => void | Promise<void>;
    finish?: () => void;
    endpoint: Endpoint<M, Partial<ResponsesOf<D>>>;
    retry?: RetryPolicy;
  };

export type FormSaveState<V = unknown, I = unknown, R = unknown> = {
  formId: string;
  status:
    | "pending"
    | "validating"
    | "invalid"
    | "ready"
    | "saving"
    | "retrying"
    | "saved"
    | "failed"
    | "skipped";
  attempts: number;
  formValues?: V;
  variables?: I;
  response?: R;
  failure?: FailureContext<V, I>;
};
export type SaveResult<P extends readonly AnyForm[]> = {
  outcome: "validation-failed" | "success" | "partial-failure" | "saved-with-follow-up-errors";
  forms: {
    [F in P[number] as F["id"]]: FormSaveState<
      ReturnType<F["snapshot"]>,
      Input<F["endpoint"]["mutationFn"]>,
      Response<F["endpoint"]["mutationFn"]>
    >;
  };
  responses: Partial<ResponsesOf<P>>;
  followUpErrors: FollowUpError[];
};
export type Phase =
  | "idle"
  | "validating"
  | "saving"
  | "refreshing"
  | "reconciling"
  | "effects"
  | "complete";

export type SaveConfig<P extends readonly AnyForm[]> = RefreshOptions & {
  forms: P;
  retry?: RetryPolicy;
  cacheUpdates?: readonly CacheUpdate<
    Partial<ResponsesOf<P>>,
    undefined,
    Partial<ResponsesOf<P>>
  >[];
  onSuccess?: (context: { result: SaveResult<P> }) => void | Promise<void>;
  onFailure?: (context: { result: SaveResult<P> }) => void | Promise<void>;
};
