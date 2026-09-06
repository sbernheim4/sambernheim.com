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

export type SaveState<P extends readonly AnyForm[]> = {
  phase: Phase;
  isSaving: boolean;
  result?: SaveResult<P>;
};
export function isTransientError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  if ("status" in error && typeof error.status === "number")
    return error.status === 408 || error.status === 429 || error.status >= 500;
  return error instanceof TypeError; // fetch network failures; only used by retry-safe endpoints
}

export function createOrchestrator<P extends readonly AnyForm[]>(
  queryClient: QueryClient,
  onChange: (state: SaveState<P>) => void = () => {},
) {
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
        if (seen.has(form.id)) {
          return Promise.reject(new Error(`Duplicate form ID: ${form.id}`));
        }

        if (form.dependencies?.some(({ id }) => !seen.has(id))) {
          return Promise.reject(new Error(`Dependencies for ${form.id} must precede it.`));
        }

        seen.add(form.id);
      }

      let release: () => void;

      try {
        release = getSaveGuard(queryClient).begin();
      } catch (error) {
        return Promise.reject(error);
      }

      active = run(captured as unknown as SaveConfig<P>, forms).finally(() => {
        active = undefined;
        release();
      });

      return active;
    },

    reset() {
      if (active) return false;
      onChange({ phase: "idle", isSaving: false });
      return true;
    },
  };

  async function run(config: SaveConfig<P>, forms: AnyForm[]): Promise<SaveResult<P>> {
    const states: Record<string, FormSaveState<any, any, any>> = Object.create(null);
    const responses: Record<string, any> = Object.create(null);

    const result = {
      outcome: "validation-failed",
      forms: states,
      responses,
      followUpErrors: [],
    } as unknown as SaveResult<P>;

    const emit = toEmit(onChange, states, result, responses);
    const fail = toFail(states);

    // Snapshot every child before awaiting validation in any child.
    snapshotForms(forms, states, fail);

    emit("validating");

    await validateForms(forms, states, fail);

    if (!forms.some((form) => states[form.id].failure)) {
      prepareIndependentPayloads(forms, states, fail);
    }

    const preflightPassed = !forms.some((form) => states[form.id].failure);

    if (preflightPassed) {
      await saveFormsInOrder(forms, states, responses, fail, config, emit);
    }

    updateSkippedFormsState(states);

    const successful = forms.filter((form) => states[form.id].status === "saved");
    const allSaved = successful.length === forms.length;

    result.outcome = getOutcome(!preflightPassed, allSaved);

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
    if (preflightPassed) {
      emit("refreshing");

      const refreshAndCacheInvalidationErrors = await refreshAndInvalidateCache(
        successful,
        config,
        queryClient,
      );
      result.followUpErrors.push(...refreshAndCacheInvalidationErrors);

      emit("reconciling");

      for (const form of successful) {
        const formCacheUpdateErrors = updateCacheWithMutationResponse(
          context(form),
          form.cacheUpdates as readonly CacheUpdate<any, any, any>[] | undefined,
          form.id,
        );
        result.followUpErrors.push(...formCacheUpdateErrors);
      }

      const configCacheUpdateErrors = updateCacheWithMutationResponse(
        {
          queryClient,
          response: result.responses,
          variables: undefined,
          results: result.responses,
        },
        config.cacheUpdates,
      );
      result.followUpErrors.push(...configCacheUpdateErrors);

      // Mark submitted values as saved without clearing edits made during the save.
      for (const form of successful) {
        try {
          await form.markSaved?.(structuredClone(states[form.id].formValues));
        } catch (error) {
          result.followUpErrors.push({
            phase: "form-state",
            formId: form.id,
            error,
          });
        }
      }
    }

    emit("effects");

    const callbackErrors = await invokeFormCallbacks(forms, states, context);
    result.followUpErrors.push(...callbackErrors);

    if (allSaved && result.followUpErrors.length) {
      result.outcome = "saved-with-follow-up-errors";
    }

    const configCallbackErrors = await invokeConfigCallbacks(allSaved, config, result);
    result.followUpErrors.push(...configCallbackErrors);

    if (allSaved && result.followUpErrors.length) {
      result.outcome = "saved-with-follow-up-errors";
    }

    const formFinishErrors = invokeFormFinish(forms);
    result.followUpErrors.push(...formFinishErrors);

    if (allSaved && result.followUpErrors.length) {
      result.outcome = "saved-with-follow-up-errors";
    }

    emit("complete");

    return result;
  }
}

async function settleRefreshes(
  queryClient: QueryClient,
  sources: readonly (RefreshOptions & { formId?: string })[],
): Promise<FollowUpError[]> {
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
      )
        throw value.error;
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
}

export function updateCacheWithMutationResponse<R, I, Results>(
  context: CacheContext<R, I, Results>,
  cacheUpdates: readonly CacheUpdate<R, I, Results>[] = [],
  formId?: string,
): FollowUpError[] {
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
}

// Clear All must wait for saves, cache updates, and callbacks to finish.
const saveGuards = new WeakMap<QueryClient, ReturnType<typeof createSaveGuard>>();

function createSaveGuard() {
  let active = 0;
  let clearing = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => active + Number(clearing),
    begin: () => {
      if (clearing) throw new Error("Workspace is being cleared.");
      active++;
      emit();
      return () => {
        active--;
        emit();
      };
    },
    beginClear: () => {
      if (active || clearing) return undefined;
      clearing = true;
      emit();
      return () => {
        clearing = false;
        emit();
      };
    },
  };
}

export function getSaveGuard(client: QueryClient) {
  let guard = saveGuards.get(client);
  if (!guard) {
    guard = createSaveGuard();
    saveGuards.set(client, guard);
  }
  return guard;
}

const validateForms = async (
  forms: AnyForm[],
  states: Record<string, FormSaveState<any, any, any>>,
  fail: (form: AnyForm, phase: "validation" | "mapping" | "save", error: unknown) => void,
) => {
  await Promise.all(
    forms.map(async (form) => {
      if (states[form.id].failure) {
        return;
      }

      try {
        const validation = await form.validate(structuredClone(states[form.id].formValues));

        if (!validation.valid) {
          fail(form, "validation", validation.error);
        } else {
          states[form.id].status = "ready";
        }
      } catch (error) {
        fail(form, "validation", error);
      }
    }),
  );
};

const getVariables = (
  form: AnyForm,
  state: FormSaveState<any, any, any>,
  responses: Record<string, any>,
) => {
  const variables = structuredClone(
    form.toMutationPayload
      ? form.toMutationPayload(structuredClone(state.formValues), {
          results: structuredClone(responses),
        })
      : state.formValues,
  );

  return variables;
};

const prepareIndependentPayloads = (
  forms: AnyForm[],
  states: Record<string, FormSaveState<any, any, any>>,
  fail: Fail,
) => {
  // Discover independent mapping errors before issuing any writes.
  for (const form of forms) {
    if (form.dependencies?.length) {
      continue;
    }

    try {
      states[form.id].variables = getVariables(form, states[form.id], {});
    } catch (error) {
      fail(form, "mapping", error);
    }
  }
};

const snapshotForms = (
  forms: AnyForm[],
  states: Record<string, FormSaveState<any, any, any>>,
  fail: (form: AnyForm, phase: "validation" | "mapping" | "save", error: unknown) => void,
) => {
  for (const form of forms) {
    states[form.id] = {
      formId: form.id,
      status: "validating",
      attempts: 0,
    };

    try {
      states[form.id].formValues = structuredClone(form.snapshot());
    } catch (error) {
      fail(form, "validation", error);
    }
  }
};

const invokeFormCallbacks = async (
  forms: AnyForm[],
  states: Record<string, FormSaveState<any, any, any>>,
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
  let callbackErrors: FollowUpError[] = [];

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

const invokeMutation = async (
  form: AnyForm,
  state: FormSaveState<any, any, any>,
  responses: Record<string, any>,
) => {
  const response = await form.endpoint.mutationFn(structuredClone(state.variables));
  // Persistence is recorded immediately, before any follow-up work.
  state.response = response;
  responses[form.id] = response;
  state.status = "saved";
};

const getRetryable = (
  form: AnyForm,
  state: FormSaveState<any, any, any>,
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
  state: FormSaveState<any, any, any>,
  retry: {
    maxRetries: number;
    delayMs: number | ((attempt: number, error: unknown) => number);
    shouldRetry: (error: unknown) => boolean;
  },
  emit: (p: Phase) => void,
  responses: Record<string, any>,
  fail: (form: AnyForm, phase: "validation" | "mapping" | "save", error: unknown) => void,
) => {
  while (true) {
    state.status = "saving";
    state.attempts++;
    emit("saving");

    try {
      await invokeMutation(form, state, responses);
      break;
    } catch (error) {
      const retryable = getRetryable(form, state, error, retry);

      if (!retryable) {
        fail(form, "save", error);
        break;
      }

      state.status = "retrying";
      emit("saving");
      let delay = 500;

      try {
        delay =
          typeof retry.delayMs === "function"
            ? retry.delayMs(state.attempts, error)
            : retry.delayMs;
      } catch {
        fail(form, "save", error);
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, Math.max(0, delay)));
    }
  }
};

const saveFormsInOrder = async <P extends readonly AnyForm[]>(
  forms: AnyForm[],
  states: Record<string, FormSaveState<any, any, any>>,
  responses: Record<string, any>,
  fail: (form: AnyForm, phase: "validation" | "mapping" | "save", error: unknown) => void,
  config: SaveConfig<P>,
  emit: (p: Phase) => void,
) => {
  for (const form of forms) {
    const state = states[form.id];

    if (form.dependencies?.length) {
      try {
        state.variables = getVariables(form, state, responses);
      } catch (error) {
        fail(form, "mapping", error);
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

    await saveFormWithRetry(form, state, retry, emit, responses, fail);

    if (state.failure) {
      break;
    }
  }
};

type Emit = (p: Phase) => void;
const toEmit = <P extends readonly AnyForm[]>(
  onChange: (state: SaveState<P>) => void,
  states: Record<string, FormSaveState<any, any, any>>,
  result: SaveResult<P>,
  responses: Record<string, any>,
): Emit => {
  const emit = (phase: Phase) => {
    return onChange({
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

  return emit;
};

type Fail = (form: AnyForm, phase: "validation" | "mapping" | "save", error: unknown) => void;
const toFail = (states: Record<string, FormSaveState<any, any, any>>): Fail => {
  const fail = (form: AnyForm, phase: "validation" | "mapping" | "save", error: unknown) => {
    const state = states[form.id];
    state.status = phase === "validation" ? "invalid" : "failed";
    state.failure = {
      formId: form.id,
      phase,
      error,
      formValues: state.formValues,
      variables: state.variables,
      attempts: state.attempts,
    };
  };

  return fail;
};

const refreshAndInvalidateCache = async <P extends readonly AnyForm[]>(
  successful: AnyForm[],
  config: SaveConfig<P>,
  queryClient: QueryClient,
): Promise<FollowUpError[]> => {
  const additionalFollowUpErrors = [
    ...(await settleRefreshes(queryClient, [
      ...successful.map((form) => ({
        refetchFunctions: form.refetchFunctions,
        invalidateQueryKeys: form.invalidateQueryKeys,
        formId: form.id,
      })),
      config,
    ])),
  ];

  return additionalFollowUpErrors;
};

const updateSkippedFormsState = (states: Record<string, FormSaveState<any, any, any>>) => {
  for (const state of Object.values(states)) {
    if (state.status === "ready") {
      state.status = "skipped";
    }
  }
};
