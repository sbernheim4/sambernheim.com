import type { QueryClient, QueryKey } from "@tanstack/react-query";

export type AsyncMutation = (variables: any, ...options: any[]) => Promise<any>;

export type Input<M extends AsyncMutation> = Parameters<M>[0];

export type Response<M extends AsyncMutation> = Awaited<ReturnType<M>>;

export type RefreshOptions = {
  readonly refetchFunctions?: readonly (() => unknown)[];
  readonly invalidateQueryKeys?: readonly QueryKey[];
};

export type RetryPolicy = {
  readonly maxRetries?: number;
  readonly delayMs?: number | ((attempt: number, error: unknown) => number);
  readonly shouldRetry?: (error: unknown) => boolean;
};

export type CacheContext<R, I, Results = {}> = {
  response: R;
  variables: I;
  results: Results;
  queryClient: QueryClient;
};

export type CacheTarget<R, I, Data = R, Results = {}> = {
  readonly queryKey: (context: CacheContext<R, I, Results>) => QueryKey;
} & ([R] extends [Data]
  ? { readonly getData?: (response: R) => Data; readonly update?: never }
  : { readonly getData: (response: R) => Data; readonly update?: never });

export type CacheUpdate<R, I, Results = {}> =
  | {
      readonly queryKey: (context: CacheContext<R, I, Results>) => QueryKey;
      readonly getData?: (response: R) => unknown;
      readonly update?: never;
    }
  | {
      readonly queryKey: (context: CacheContext<R, I, Results>) => QueryKey;
      readonly getData?: never;
      readonly update: (previous: unknown, context: CacheContext<R, I, Results>) => unknown;
    };

export type FollowUpError = {
  phase: "refresh" | "cache" | "form-state" | "effect";
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
  readonly onSuccess?: (context: SuccessContext<V, I, R, Results>) => void | Promise<void>;
  readonly onFailure?: (context: FailureContext<V, I>) => void | Promise<void>;
};

export type Endpoint<M extends AsyncMutation> = {
  readonly mutationFn: M;
  /** Only idempotent operations may opt into automatic retries. */
  readonly retrySafe?: boolean;
};

export type ValidationResult = { valid: true } | { valid: false; error: unknown };

export type PayloadMapping<V, I, Results> = [V] extends [I]
  ? { readonly toMutationPayload?: (values: V, context: { results: Results }) => I }
  : { readonly toMutationPayload: (values: V, context: { results: Results }) => I };

/** Common shape consumed by the save loop; callbacks retain their types at declaration. */
export type AnyForm = {
  id: string;
  dependencies?: readonly { id: string }[];
  snapshot: () => unknown;
  undoSnapshot?: () => unknown;
  undoResponse?: () => unknown;
  validate: (...args: any[]) => ValidationResult | Promise<ValidationResult>;
  toMutationPayload?: (...args: any[]) => any;
  markSaved?: (...args: any[]) => void | Promise<void>;
  finish?: () => void;
  onSuccess?: (...args: any[]) => void | Promise<void>;
  onFailure?: (...args: any[]) => void | Promise<void>;
  retry?: RetryPolicy;
  refetchFunctions?: readonly (() => unknown)[];
  invalidateQueryKeys?: readonly QueryKey[];
  cacheUpdates?: readonly CacheUpdate<never, any, any>[];
  endpoint: {
    mutationFn: AsyncMutation;
    retrySafe?: boolean;
  };
  form: {
    reset: (...args: never[]) => void;
  };
};

/** Read-only view used while the orchestrator consumes a form definition. */
export type FormInput<F extends AnyForm = AnyForm> = Readonly<F> & {
  readonly endpoint: Readonly<F["endpoint"]>;
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
    readonly id: Id;
    readonly dependencies?: Readonly<D>;
    readonly snapshot: () => V;
    readonly validate: (values: V) => ValidationResult | Promise<ValidationResult>;
    readonly markSaved?: (values: V) => void | Promise<void>;
    readonly finish?: () => void;
    readonly endpoint: Endpoint<M>;
    readonly refetchFunctions?: readonly (() => unknown)[];
    readonly invalidateQueryKeys?: readonly QueryKey[];
    readonly cacheUpdates?: readonly CacheUpdate<
      Response<NoInfer<M>>,
      Input<NoInfer<M>>,
      Partial<ResponsesOf<D>>
    >[];
    readonly retry?: RetryPolicy;
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
  blockedBy?: readonly string[];
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
  undoFormValues?: Readonly<Record<string, unknown>>;
  undoPayloads?: Readonly<Record<string, unknown>>;
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
  readonly forms: Readonly<P>;
  readonly progressDelayMs?: number;
  /** Maximum number of ready graph nodes that may mutate concurrently. */
  readonly maxConcurrency?: number;
  readonly onProgressClose?: () => void | Promise<void>;
  readonly undoFormValues?: Readonly<Record<string, unknown>>;
  readonly undoPayloads?: Readonly<Record<string, unknown>>;
  readonly retry?: RetryPolicy;
  readonly cacheUpdates?: readonly CacheUpdate<
    Partial<ResponsesOf<P>>,
    undefined,
    Partial<ResponsesOf<P>>
  >[];
  readonly onSuccess?: (context: { result: SaveResult<P> }) => void | Promise<void>;
  readonly onFailure?: (context: { result: SaveResult<P> }) => void | Promise<void>;
};
