import type { QueryClient } from "@tanstack/react-query";
import type {
  AnyForm,
  SaveConfig,
  SaveResult,
  FormSaveState,
  Phase,
  CacheContext,
  CacheUpdate,
  FollowUpError,
  RefreshOptions,
} from "./types.ts";

// Helpers read caller-owned state and return their own updated values.
type FormState = Readonly<FormSaveState<any, any, any>>;
type FormStates = Readonly<Record<string, FormState>>;
type Responses = Readonly<Record<string, any>>;

export type SaveState<P extends readonly AnyForm[]> = {
  phase: Phase;
  isSaving: boolean;
  result?: SaveResult<P>;
};

const isTransientError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  if ("status" in error && typeof error.status === "number") {
    return error.status === 408 || error.status === 429 || error.status >= 500;
  }

  return error instanceof TypeError; // fetch network failures; only used by retry-safe endpoints
};

export const createOrchestrator = <P extends readonly AnyForm[]>(
  queryClient: QueryClient,
  onChange: (state: SaveState<P>) => void = () => {},
) => {
  let active: Promise<SaveResult<P>> | undefined;

  return {
    submit(config: SaveConfig<P>): Promise<SaveResult<P>> {
      if (active) {
        return active;
      }

      // Capture definitions/callbacks at submission, never read a React ref during a run.
      const captured = {
        ...config,
        forms: config.forms.map((form) => ({
          ...form,
          dependencies: form.dependencies?.map(({ id }) => ({ id })),
          retry: form.retry && { ...form.retry },
          refetchFunctions: form.refetchFunctions?.slice(),
          invalidateQueryKeys: form.invalidateQueryKeys?.map((key) => [...key]),
          cacheUpdates: form.cacheUpdates?.map((target) => ({ ...target })),
          endpoint: {
            ...form.endpoint,
          },
        })),
        retry: config.retry && { ...config.retry },
        refetchFunctions: config.refetchFunctions?.slice(),
        invalidateQueryKeys: config.invalidateQueryKeys?.map((key) => [...key]),
        cacheUpdates: config.cacheUpdates?.map((target) => ({ ...target })),
      };

      const forms = captured.forms;
      const seen = new Set<string>();

      for (const form of forms) {
        const hasBeenProcessed = seen.has(form.id);
        if (hasBeenProcessed) {
          return Promise.reject(new Error(`Duplicate form ID: ${form.id}`));
        }

        const isOutOfOrderDep = form.dependencies?.some(({ id }) => !seen.has(id))
        if (isOutOfOrderDep) {
          return Promise.reject(new Error(`Dependencies for ${form.id} must precede it.`));
        }

        seen.add(form.id);
      }

      active = run(captured as unknown as SaveConfig<P>, forms).finally(() => {
        active = undefined;
      });

      return active;
    },

    reset() {
      if (active) {
        return false;
      }
      onChange({ phase: "idle", isSaving: false });
      return true;
    },
  };

  async function run(config: SaveConfig<P>, forms: AnyForm[]): Promise<SaveResult<P>> {
    let states = snapshotForms(forms);
    let responses: Responses = {};

    const result = {
      outcome: "validation-failed",
      forms: states,
      responses,
      followUpErrors: [],
    } as unknown as SaveResult<P>;

    const emit = (phase: Phase, currentStates = states, currentResponses = responses) => {
      emitProgress(onChange, phase, result, currentStates, currentResponses);
    };

    // Every snapshot is captured synchronously before any validation starts.
    emit("validating");

    states = await validateForms(forms, states);

    const noFormsFailed = !forms.some((form) => states[form.id].failure);

    if (noFormsFailed) {
      states = prepareIndependentPayloads(forms, states);

      const saved = await saveFormsInOrder(forms, states, responses, config, emit);

      states = saved.states;
      responses = saved.responses;
    }

    states = updateSkippedFormsState(states);
    result.forms = states as SaveResult<P>["forms"];
    result.responses = responses as SaveResult<P>["responses"];

    const successful = forms.filter((form) => states[form.id].status === "saved");
    const allSaved = successful.length === forms.length;

    result.outcome = getOutcome(!noFormsFailed, allSaved);

    const context = (form: AnyForm) => ({
      queryClient,
      response: states[form.id].response,
      variables: states[form.id].variables,
      results: responses,
      formValues: states[form.id].formValues,
      formId: form.id,
      attempts: states[form.id].attempts,
      followUpErrors: result.followUpErrors,
    });

    // After writes, refresh only successful forms, plus group-level queries.
    // This includes partial saves; failed and skipped forms have no follow-ups.
    if (noFormsFailed) {
      emit("refreshing");

      const refreshAndCacheInvalidationErrors = await refreshAndInvalidateCache(
        successful,
        config,
        queryClient,
      );

      emit("reconciling");

      const cacheUpdateErrors = reconcileCacheWithMutationResponses(
        successful,
        context,
        result,
        queryClient,
        config,
      );

      const markSavedErrors = await markFormsSaved(successful, states);

      result.followUpErrors.push(
        ...refreshAndCacheInvalidationErrors,
        ...cacheUpdateErrors,
        ...markSavedErrors,
      );
    }

    emit("effects");

    const formCallbackErrors = await invokeFormCallbacks(forms, states, context);
    const configCallbackErrors = await invokeConfigCallbacks(allSaved, config, result);
    const formFinishErrors = invokeFormFinish(forms);

    result.followUpErrors.push(...formCallbackErrors, ...configCallbackErrors, ...formFinishErrors);

    if (allSaved && result.followUpErrors.length) {
      result.outcome = "saved-with-follow-up-errors";
    }

    emit("complete");

    return result;
  }
};

const settleRefreshes = async (
  queryClient: QueryClient,
  sources: readonly (RefreshOptions & { formId?: string })[],
): Promise<FollowUpError[]> => {
  const refetchAndInvalidationsQueue = sources.flatMap((source) => [
    ...(source.invalidateQueryKeys ?? []).map((queryKey) => ({
      formId: source.formId,
      run: () =>
        queryClient.invalidateQueries({ queryKey }, { cancelRefetch: false, throwOnError: true }),
    })),

    ...(source.refetchFunctions ?? []).map((run) => ({
      formId: source.formId,
      run,
    })),
  ]);

  const settled = await Promise.allSettled(
    refetchAndInvalidationsQueue.map(async ({ run }) => {
      // execute the refetch function or query cache invalidation
      const value = await run();

      // Query-hook refetch methods resolve error results unless throwOnError is set.
      if (
        value &&
        typeof value === "object" &&
        "isError" in value &&
        value.isError &&
        "error" in value
      ) {
        throw value.error;
      }
    }),
  );

  const erroredRefetchAndInvalidations = settled.flatMap((entry, index) =>
    entry.status === "rejected"
      ? [
          {
            phase: "refresh" as const,
            formId: refetchAndInvalidationsQueue[index].formId,
            error: entry.reason,
          },
        ]
      : [],
  );

  return erroredRefetchAndInvalidations;
};

const updateCacheWithMutationResponse = <R, I, Results>(
  context: CacheContext<R, I, Results>,
  cacheUpdates: readonly CacheUpdate<R, I, Results>[] = [],
  formId?: string,
): FollowUpError[] => {
  const errors: FollowUpError[] = [];

  for (const cacheUpdate of cacheUpdates) {
    try {
      const key = cacheUpdate.queryKey(context);

      if (cacheUpdate.update) {
        context.queryClient.setQueryData(key, (previous: unknown) =>
          cacheUpdate.update!(previous, context),
        );
      } else {
        const data = cacheUpdate.getData ? cacheUpdate.getData(context.response) : context.response;
        context.queryClient.setQueryData(key, () => data);
      }
    } catch (error) {
      errors.push({ phase: "cache", formId, error });
    }
  }

  return errors;
};

const validateForms = async (
  forms: readonly AnyForm[],
  states: FormStates,
): Promise<FormStates> => {
  const validated = await Promise.all(
    forms.map(async (form): Promise<[string, FormState]> => {
      const state = states[form.id];
      if (state.failure) {
        return [form.id, state];
      }

      try {
        const validation = await form.validate(structuredClone(state.formValues));
        return [
          form.id,
          validation.valid
            ? { ...state, status: "ready" }
            : getFailedState(state, "validation", validation.error),
        ];
      } catch (error) {
        return [form.id, getFailedState(state, "validation", error)];
      }
    }),
  );
  return Object.fromEntries(validated);
};

const getVariables = (form: AnyForm, state: FormState, responses: Responses) => {
  const variables = structuredClone(
    form.toMutationPayload
      ? form.toMutationPayload(structuredClone(state.formValues), {
          results: structuredClone(responses),
        })
      : state.formValues,
  );

  return variables;
};

const prepareIndependentPayloads = (forms: readonly AnyForm[], states: FormStates): FormStates => {
  // Discover independent mapping errors before issuing any writes.
  return Object.fromEntries(
    forms.map((form) => {
      const state = states[form.id];
      if (form.dependencies?.length) {
        return [form.id, state];
      }

      try {
        return [form.id, { ...state, variables: getVariables(form, state, {}) }];
      } catch (error) {
        return [form.id, getFailedState(state, "mapping", error)];
      }
    }),
  );
};

const snapshotForms = (forms: readonly AnyForm[]): FormStates => {
  return Object.fromEntries(
    forms.map((form) => {
      const state: FormState = {
        formId: form.id,
        status: "validating",
        attempts: 0,
      };

      try {
        return [form.id, { ...state, formValues: structuredClone(form.snapshot()) }];
      } catch (error) {
        return [form.id, getFailedState(state, "validation", error)];
      }
    }),
  );
};

const invokeFormCallbacks = async (
  forms: readonly AnyForm[],
  states: FormStates,
  context: (form: AnyForm) => {
    queryClient: QueryClient;
    response: any;
    variables: any;
    results: Record<string, any>;
    formValues: any;
    formId: string;
    attempts: number;
    followUpErrors: FollowUpError[];
  },
): Promise<FollowUpError[]> => {
  const callbackErrors: FollowUpError[] = [];

  for (const form of forms) {
    try {
      if (states[form.id].status === "saved") {
        await form.onSuccess?.(context(form));
      } else if (states[form.id].failure) {
        await form.onFailure?.(states[form.id].failure!);
      }
    } catch (error) {
      callbackErrors.push({
        phase: "effect",
        formId: form.id,
        error,
      });
    }
  }

  return callbackErrors;
};

const invokeConfigCallbacks = async <P extends readonly AnyForm[]>(
  allSaved: boolean,
  config: SaveConfig<P>,
  result: SaveResult<P>,
): Promise<FollowUpError[]> => {
  try {
    await (allSaved ? config.onSuccess : config.onFailure)?.({ result });
    return [];
  } catch (error) {
    return [
      {
        phase: "effect",
        error,
      },
    ];
  }
};

// Mark submitted values as saved without clearing edits made during the save.
const markFormsSaved = async (
  forms: readonly AnyForm[],
  states: FormStates,
): Promise<FollowUpError[]> => {
  const errors: FollowUpError[] = [];
  for (const form of forms) {
    try {
      await form.markSaved?.(structuredClone(states[form.id].formValues));
    } catch (error) {
      errors.push({ phase: "form-state", formId: form.id, error });
    }
  }
  return errors;
};

const invokeFormFinish = (forms: AnyForm[]): FollowUpError[] => {
  const finishErrors: FollowUpError[] = [];

  for (const form of forms) {
    try {
      form.finish?.();
    } catch (error) {
      finishErrors.push({
        phase: "form-state",
        formId: form.id,
        error,
      });
    }
  }

  return finishErrors;
};

const getOutcome = (hasSomeFailure: boolean, allSaved: boolean) => {
  return hasSomeFailure ? "validation-failed" : allSaved ? "success" : "partial-failure";
};

const invokeMutation = async (form: AnyForm, state: FormState): Promise<FormState> => {
  const response = await form.endpoint.mutationFn(structuredClone(state.variables));
  return { ...state, response, status: "saved" };
};

const getRetryable = (
  form: AnyForm,
  state: FormState,
  error: unknown,
  retry: {
    maxRetries: number;
    delayMs: number | ((attempt: number, error: unknown) => number);
    shouldRetry: (error: unknown) => boolean;
  },
) => {
  let retryable = false;
  try {
    retryable =
      !!form.endpoint.retrySafe && state.attempts <= retry.maxRetries && retry.shouldRetry(error);
  } catch {
    /* predicate errors must not hide the request error */
  }

  return retryable;
};

const saveFormWithRetry = async (
  form: AnyForm,
  initialState: FormState,
  retry: {
    maxRetries: number;
    delayMs: number | ((attempt: number, error: unknown) => number);
    shouldRetry: (error: unknown) => boolean;
  },
  onProgress: (state: FormState) => void,
): Promise<FormState> => {
  let state = initialState;
  while (true) {
    state = { ...state, status: "saving", attempts: state.attempts + 1 };
    onProgress(state);

    try {
      return await invokeMutation(form, state);
    } catch (error) {
      if (!getRetryable(form, state, error, retry)) {
        return getFailedState(state, "save", error);
      }

      state = { ...state, status: "retrying" };
      onProgress(state);
      let delay: number;

      try {
        delay =
          typeof retry.delayMs === "function"
            ? retry.delayMs(state.attempts, error)
            : retry.delayMs;
      } catch {
        return getFailedState(state, "save", error);
      }

      await new Promise((resolve) => setTimeout(resolve, Math.max(0, delay)));
    }
  }
};

const saveFormsInOrder = async <P extends readonly AnyForm[]>(
  forms: readonly AnyForm[],
  initialStates: FormStates,
  initialResponses: Responses,
  config: SaveConfig<P>,
  emit: (phase: Phase, states: FormStates, responses: Responses) => void,
): Promise<{ states: FormStates; responses: Responses }> => {
  // These accumulators belong to this helper, never to its caller.
  const states = { ...initialStates };
  const responses = { ...initialResponses };

  for (const form of forms) {
    let state = states[form.id];

    if (form.dependencies?.length) {
      try {
        state = { ...state, variables: getVariables(form, state, responses) };
      } catch (error) {
        states[form.id] = getFailedState(state, "mapping", error);
        break;
      }
    }

    const retry = {
      maxRetries: 1,
      delayMs: 500,
      shouldRetry: isTransientError,
      ...config.retry,
      ...form.retry,
    };

    state = await saveFormWithRetry(form, state, retry, (progress) => {
      emit("saving", { ...states, [form.id]: progress }, { ...responses });
    });
    states[form.id] = state;

    // Record persistence before the next dependent mapping or any follow-up.
    if (state.status === "saved") {
      responses[form.id] = state.response;
    }
    if (state.failure) {
      break;
    }
  }

  return { states, responses };
};

const emitProgress = <P extends readonly AnyForm[]>(
  onChange: (state: SaveState<P>) => void,
  phase: Phase,
  result: SaveResult<P>,
  states: FormStates,
  responses: Responses,
): void => {
  onChange({
    phase,
    isSaving: phase !== "complete",
    result: {
      ...result,
      forms: Object.fromEntries(
        Object.entries(states).map(([id, state]) => [id, { ...state }]),
      ) as SaveResult<P>["forms"],
      responses: { ...responses } as SaveResult<P>["responses"],
      followUpErrors: [...result.followUpErrors],
    },
  });
};

const getFailedState = (
  state: FormState,
  phase: "validation" | "mapping" | "save",
  error: unknown,
): FormState => ({
  ...state,
  status: phase === "validation" ? "invalid" : "failed",
  failure: {
    formId: state.formId,
    phase,
    error,
    formValues: state.formValues,
    variables: state.variables,
    attempts: state.attempts,
  },
});

const refreshAndInvalidateCache = async <P extends readonly AnyForm[]>(
  successful: AnyForm[],
  config: SaveConfig<P>,
  queryClient: QueryClient,
): Promise<FollowUpError[]> => {
  const refreshAndCacheInvalidationErrors = [
    ...(await settleRefreshes(queryClient, [
      ...successful.map((form) => ({
        refetchFunctions: form.refetchFunctions,
        invalidateQueryKeys: form.invalidateQueryKeys,
        formId: form.id,
      })),
      config,
    ])),
  ];

  return refreshAndCacheInvalidationErrors;
};

const updateSkippedFormsState = (states: FormStates): FormStates => {
  return Object.fromEntries(
    Object.entries(states).map(([id, state]) => [
      id,
      state.status === "ready" ? { ...state, status: "skipped" } : state,
    ]),
  );
};

const reconcileCacheWithMutationResponses = <P extends readonly AnyForm[]>(
  successful: AnyForm[],
  context: (form: AnyForm) => {
    queryClient: QueryClient;
    response: any;
    variables: any;
    results: Readonly<Record<string, any>>;
    formValues: any;
    formId: string;
    attempts: number;
    followUpErrors: FollowUpError[];
  },
  result: SaveResult<P>,
  queryClient: QueryClient,
  config: SaveConfig<P>,
): FollowUpError[] => {
  const formCacheUpdateErrors = successful.flatMap((form) => {
    return updateCacheWithMutationResponse(
      context(form),
      form.cacheUpdates as readonly CacheUpdate<any, any, any>[] | undefined,
      form.id,
    );
  });

  const configCacheUpdateErrors = updateCacheWithMutationResponse(
    {
      queryClient,
      response: result.responses,
      variables: undefined,
      results: result.responses,
    },
    config.cacheUpdates,
  );

  return [...formCacheUpdateErrors, ...configCacheUpdateErrors];
};
