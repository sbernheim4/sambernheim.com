import type { QueryClient } from "@tanstack/react-query";
import type {
  AnyForm,
  FormInput,
  SaveConfig,
  SaveResult,
  FormSaveState,
  Phase,
  CacheContext,
  CacheUpdate,
  FollowUpError,
  RefreshOptions,
} from "./types";

// Helpers read caller-owned state and return their own updated values.
type FormState = Readonly<FormSaveState<any, any, any>>;
type FormStates = Readonly<Record<string, FormState>>;
type Responses = Readonly<Record<string, any>>;

export type SaveState<P extends readonly AnyForm[]> = {
  phase: Phase;
  isSaving: boolean;
  result?: SaveResult<P>;
};

type RunContext<P extends readonly AnyForm[]> = {
  forms: readonly FormInput[];
  config: SaveConfig<P>;
  queryClient: QueryClient;
  states: FormStates;
  responses: Responses;
  result: SaveResult<P>;
  successful: readonly FormInput[];
  allSaved: boolean;
  emit: (phase: Phase) => void;
};

type RunStage<P extends readonly AnyForm[]> = {
  name: string;
  run: (context: RunContext<P>) => Promise<void>;
};

export const createOrchestrator = <P extends readonly AnyForm[]>(
  queryClient: QueryClient,
  onChange: (state: SaveState<P>) => void = () => {},
) => {
  let active: Promise<SaveResult<P>> | undefined;

  const run = async (config: SaveConfig<P>): Promise<SaveResult<P>> => {
    const context = createRunContext(config, queryClient, onChange);

    for (const stage of runStages) {
      await stage.run(context);
    }

    return context.result;
  };

  const submit = (config: SaveConfig<P>): Promise<SaveResult<P>> => {
    if (active) {
      return active;
    }

    const { forms } = config;

    const errors = preflightFormsChecks(forms);

    if (errors.length) {
      return Promise.reject(
        new AggregateError(
          errors,
          errors
            .map((error) => {
              return error.message;
            })
            .join("; "),
        ),
      );
    }

    active = run(config).finally(() => {
      active = undefined;
    });

    return active;
  };

  const reset = (config: SaveConfig<P>) => {
    if (active) {
      return false;
    }

    onChange({ phase: "idle", isSaving: false });

    config.forms.map((form) => {
      form.form.reset();
    });

    return true;
  };

  return {
    submit,
    reset,
  };
};

const createRunContext = <P extends readonly AnyForm[]>(
  config: SaveConfig<P>,
  queryClient: QueryClient,
  onChange: (state: SaveState<P>) => void,
): RunContext<P> => {
  const context = {
    forms: config.forms,
    config,
    queryClient,
    states: {},
    responses: {},
    result: {
      outcome: "validation-failed",
      forms: {},
      responses: {},
      followUpErrors: [],
    },
    successful: [],
    allSaved: false,
    emit: (phase: Phase) => {},
  } as unknown as RunContext<P>;

  context.emit = (phase) => {
    emitProgress(onChange, phase, context.result, context.states, context.responses);
  };

  return context;
};

const snapshotStage = async <P extends readonly AnyForm[]>(context: RunContext<P>) => {
  const undoState = context.config.undoPayloads ? undefined : captureUndoState(context.forms);

  context.states = snapshotForms(context.forms, context.config.undoFormValues);
  context.result = {
    outcome: "validation-failed",
    forms: context.states as SaveResult<P>["forms"],
    responses: context.responses as SaveResult<P>["responses"],
    followUpErrors: [],
    undoFormValues: undoState?.formValues,
    undoPayloads: undoState?.payloads,
  };

  // All snapshots are captured synchronously before validation starts.
  context.emit("validating");
};

const validateStage = async <P extends readonly AnyForm[]>(context: RunContext<P>) => {
  context.states = await validateForms(context.forms, context.states);
};

const hasValidationFailure = (context: RunContext<any>) => {
  return context.forms.some((form) => context.states[form.id].failure?.phase === "validation");
};

const preparePayloadStage = async <P extends readonly AnyForm[]>(context: RunContext<P>) => {
  if (!hasValidationFailure(context)) {
    context.states = prepareIndependentPayloads(
      context.forms,
      context.states,
      context.config.undoPayloads,
    );
  }
};

const saveStage = async <P extends readonly AnyForm[]>(context: RunContext<P>) => {
  if (hasValidationFailure(context)) {
    return;
  }

  const saved = await saveFormsInGraph(
    context.forms,
    context.states,
    context.responses,
    context.config,
    (phase, states, responses) => {
      context.states = states;
      context.responses = responses;
      context.emit(phase);
    },
  );

  context.states = saved.states;
  context.responses = saved.responses;
};

const finalizeStage = async <P extends readonly AnyForm[]>(context: RunContext<P>) => {
  context.states = updateSkippedFormsState(context.states);
  context.result.forms = context.states as SaveResult<P>["forms"];
  context.result.responses = context.responses as SaveResult<P>["responses"];
  context.successful = context.forms.filter((form) => context.states[form.id].status === "saved");
  context.allSaved = context.successful.length === context.forms.length;
  context.result.outcome = getOutcome(hasValidationFailure(context), context.allSaved);
};

const getFormContext = (context: RunContext<any>, form: FormInput) => ({
  queryClient: context.queryClient,
  response: context.states[form.id].response,
  variables: context.states[form.id].variables,
  results: context.responses,
  formValues: context.states[form.id].formValues,
  formId: form.id,
  attempts: context.states[form.id].attempts,
  followUpErrors: context.result.followUpErrors,
});

const refreshStage = async <P extends readonly AnyForm[]>(context: RunContext<P>) => {
  if (hasValidationFailure(context)) {
    return;
  }

  await waitForProgress(context.config.progressDelayMs ?? 0);
  context.emit("refreshing");

  context.result.followUpErrors.push(
    ...(await refreshAndInvalidateCache(context.successful, context.config, context.queryClient)),
  );
};

const reconcileStage = async <P extends readonly AnyForm[]>(context: RunContext<P>) => {
  if (hasValidationFailure(context)) {
    return;
  }

  await waitForProgress(context.config.progressDelayMs ?? 0);
  context.emit("reconciling");

  context.result.followUpErrors.push(
    ...reconcileCacheWithMutationResponses(
      context.successful,
      (form) => getFormContext(context, form),
      context.result,
      context.queryClient,
      context.config,
    ),
  );
};

const markSavedStage = async <P extends readonly AnyForm[]>(context: RunContext<P>) => {
  if (hasValidationFailure(context)) {
    return;
  }

  context.result.followUpErrors.push(...(await markFormsSaved(context.successful, context.states)));
};

const effectsStage = async <P extends readonly AnyForm[]>(context: RunContext<P>) => {
  await waitForProgress(context.config.progressDelayMs ?? 0);
  context.emit("effects");

  const formCallbackErrors = await invokeFormCallbacks(context.forms, context.states, (form) =>
    getFormContext(context, form),
  );
  const configCallbackErrors = await invokeConfigCallbacks(
    context.allSaved,
    context.config,
    context.result,
  );
  const formFinishErrors = invokeFormFinish(context.forms);

  context.result.followUpErrors.push(
    ...formCallbackErrors,
    ...configCallbackErrors,
    ...formFinishErrors,
  );

  if (context.allSaved && context.result.followUpErrors.length) {
    context.result.outcome = "saved-with-follow-up-errors";
  }
};

const completeStage = async <P extends readonly AnyForm[]>(context: RunContext<P>) => {
  context.emit("complete");
};

const runStages: readonly RunStage<any>[] = [
  { name: "snapshot", run: snapshotStage },
  { name: "validate", run: validateStage },
  { name: "prepare-payloads", run: preparePayloadStage },
  { name: "save", run: saveStage },
  { name: "finalize", run: finalizeStage },
  { name: "refresh", run: refreshStage },
  { name: "reconcile", run: reconcileStage },
  { name: "mark-saved", run: markSavedStage },
  { name: "effects", run: effectsStage },
  { name: "complete", run: completeStage },
];

const preflightFormsChecks = <P extends readonly AnyForm[]>(forms: P): Error[] => {
  const ids = new Set(
    forms.map((form) => {
      return form.id;
    }),
  );

  const seen = new Set<string>();

  const errors: Error[] = [];

  for (const form of forms) {
    if (seen.has(form.id)) {
      errors.push(new Error(`Duplicate form ID: ${form.id}`));
    }

    for (const dependency of form.dependencies ?? []) {
      if (!ids.has(dependency.id)) {
        errors.push(new Error(`Missing dependency ${dependency.id} for ${form.id}.`));
      }

      if (dependency.id === form.id) {
        errors.push(new Error(`Form ${form.id} cannot depend on itself.`));
      }
    }

    seen.add(form.id);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  const byId = new Map(
    forms.map((form) => {
      return [form.id, form];
    }),
  );

  const visit = (id: string, path: readonly string[]) => {
    if (visiting.has(id)) {
      errors.push(new Error(`Circular dependency detected: ${[...path, id].join(" -> ")}.`));
      return;
    }

    if (visited.has(id)) {
      return;
    }

    visiting.add(id);

    for (const dependency of byId.get(id)?.dependencies ?? []) {
      if (byId.has(dependency.id)) {
        visit(dependency.id, [...path, id]);
      }
    }

    visiting.delete(id);
    visited.add(id);
  };

  for (const form of forms) {
    visit(form.id, []);
  }

  return errors;
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

const waitForProgress = async (delayMs: number) => {
  if (delayMs <= 0) {
    return;
  }

  await new Promise((resolve) => {
    return setTimeout(resolve, delayMs);
  });
};

const settleRefreshes = async (
  queryClient: QueryClient,
  sources: readonly (RefreshOptions & {
    formId?: string;
  })[],
): Promise<FollowUpError[]> => {
  const refetchAndInvalidationsQueue = sources.flatMap((source) => {
    const { invalidateQueryKeys = [], refetchFunctions = [] } = source;

    const queryKeyInvalidations = invalidateQueryKeys.map((queryKey) => {
      return {
        formId: source.formId,
        run: () => {
          return queryClient.invalidateQueries(
            { queryKey },
            { cancelRefetch: false, throwOnError: true },
          );
        },
      };
    });

    const refetchFns = refetchFunctions.map((run) => {
      return {
        formId: source.formId,
        run,
      };
    });

    return [...queryKeyInvalidations, ...refetchFns];
  });

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

  const erroredRefetchAndInvalidations = settled
    .filter((x) => {
      return x.status === "rejected";
    })
    .map((entry, index) => {
      return {
        phase: "refresh" as const,
        formId: refetchAndInvalidationsQueue[index].formId,
        error: entry.reason,
      };
    });

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
        context.queryClient.setQueryData(key, (previous: unknown) => {
          return cacheUpdate.update!(previous, context);
        });
      } else {
        const data = cacheUpdate.getData ? cacheUpdate.getData(context.response) : context.response;
        context.queryClient.setQueryData(key, () => {
          return data;
        });
      }
    } catch (error) {
      errors.push({ phase: "cache", formId, error });
    }
  }

  return errors;
};

const validateForms = async (
  forms: readonly FormInput[],
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

const getVariables = (form: FormInput, state: FormState, responses: Responses) => {
  const variables = structuredClone(
    form.toMutationPayload
      ? form.toMutationPayload(structuredClone(state.formValues), {
          results: structuredClone(responses),
        })
      : state.formValues,
  );

  return variables;
};

const getVariablesWithOverrides = (
  form: FormInput,
  state: FormState,
  responses: Responses,
  payloadOverrides?: Readonly<Record<string, unknown>>,
) => {
  if (payloadOverrides && Object.hasOwn(payloadOverrides, form.id)) {
    return structuredClone(payloadOverrides[form.id]);
  }

  return getVariables(form, state, responses);
};

const prepareIndependentPayloads = (
  forms: readonly FormInput[],
  states: FormStates,
  payloadOverrides?: Readonly<Record<string, unknown>>,
): FormStates => {
  // Discover independent mapping errors before issuing any writes.
  return Object.fromEntries(
    forms.map((form) => {
      const state = states[form.id];

      if (form.dependencies?.length) {
        return [form.id, state];
      }

      try {
        return [
          form.id,
          { ...state, variables: getVariablesWithOverrides(form, state, {}, payloadOverrides) },
        ];
      } catch (error) {
        return [form.id, getFailedState(state, "mapping", error)];
      }
    }),
  );
};

const captureUndoState = (forms: readonly FormInput[]) => {
  const formValues: Record<string, unknown> = {};
  const responses: Record<string, unknown> = {};

  try {
    for (const form of forms) {
      const values = form.undoSnapshot?.();

      if (values === undefined) {
        return undefined;
      }

      formValues[form.id] = structuredClone(values);

      const response = form.undoResponse?.();

      if (response !== undefined) {
        responses[form.id] = structuredClone(response);
      }
    }

    const payloads: Record<string, unknown> = {};

    const remaining = new Set(
      forms.map((form) => {
        return form.id;
      }),
    );

    while (remaining.size) {
      const ready = forms.filter((form) => {
        return (
          remaining.has(form.id) &&
          (form.dependencies ?? []).every((dependency) => {
            return Object.hasOwn(payloads, dependency.id);
          })
        );
      });

      if (!ready.length) {
        return undefined;
      }

      for (const form of ready) {
        const state: FormState = {
          formId: form.id,
          status: "ready",
          attempts: 0,
          formValues: formValues[form.id],
        };

        payloads[form.id] = getVariables(form, state, responses);
        remaining.delete(form.id);
      }
    }

    return { formValues, payloads };
  } catch {
    return undefined;
  }
};

const snapshotForms = (
  forms: readonly FormInput[],
  formValueOverrides?: Readonly<Record<string, unknown>>,
): FormStates => {
  return Object.fromEntries(
    forms.map((form) => {
      const state: FormState = {
        formId: form.id,
        status: "validating",
        attempts: 0,
      };

      try {
        const formValues =
          formValueOverrides && Object.hasOwn(formValueOverrides, form.id)
            ? formValueOverrides[form.id]
            : form.snapshot();

        return [form.id, { ...state, formValues: structuredClone(formValues) }];
      } catch (error) {
        return [form.id, getFailedState(state, "validation", error)];
      }
    }),
  );
};

const invokeFormCallbacks = async (
  forms: readonly FormInput[],
  states: FormStates,
  context: (form: FormInput) => {
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
  forms: readonly FormInput[],
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

const invokeFormFinish = (forms: readonly FormInput[]): FollowUpError[] => {
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

const invokeMutation = async (form: FormInput, state: FormState): Promise<FormState> => {
  const response = await form.endpoint.mutationFn(structuredClone(state.variables));

  return { ...state, response, status: "saved" };
};

const getRetryable = (
  form: FormInput,
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
  form: FormInput,
  initialState: FormState,
  retry: {
    maxRetries: number;
    delayMs: number | ((attempt: number, error: unknown) => number);
    shouldRetry: (error: unknown) => boolean;
  },
  onProgress: (state: FormState) => void,
  progressDelayMs: number,
): Promise<FormState> => {
  let state = initialState;

  while (true) {
    state = { ...state, status: "saving", attempts: state.attempts + 1 };
    onProgress(state);

    try {
      await waitForProgress(progressDelayMs);

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

      await new Promise((resolve) => {
        return setTimeout(resolve, Math.max(0, delay));
      });
    }
  }
};

const saveFormsInGraph = async <P extends readonly AnyForm[]>(
  forms: readonly FormInput[],
  initialStates: FormStates,
  initialResponses: Responses,
  config: SaveConfig<P>,
  emit: (phase: Phase, states: FormStates, responses: Responses) => void,
): Promise<{
  states: FormStates;
  responses: Responses;
}> => {
  const states = { ...initialStates };
  const responses = { ...initialResponses };

  const undo = config.undoPayloads !== undefined;
  const maxConcurrency = normalizeConcurrency(config.maxConcurrency);
  const dependents = new Map<string, string[]>();
  for (const form of forms) {
    dependents.set(form.id, []);
  }
  for (const form of forms) {
    for (const dependency of form.dependencies ?? []) {
      dependents.get(dependency.id)?.push(form.id);
    }
  }

  const prerequisites = (form: FormInput) => {
    return undo
      ? (dependents.get(form.id) ?? [])
      : (form.dependencies ?? []).map((dependency) => {
          return dependency.id;
        });
  };

  while (true) {
    const pending = forms.filter((form) => {
      return states[form.id].status === "ready";
    });
    if (!pending.length) {
      break;
    }

    const blocked = pending.filter((form) => {
      return prerequisites(form).some((dependencyId) => {
        const dependency = states[dependencyId];
        return dependency?.status === "failed" || dependency?.status === "skipped";
      });
    });

    for (const form of blocked) {
      states[form.id] = {
        ...states[form.id],
        status: "skipped",
        blockedBy: prerequisites(form).filter((dependencyId) => {
          const dependency = states[dependencyId];
          return dependency?.status === "failed" || dependency?.status === "skipped";
        }),
      };
    }

    const ready = pending.filter((form) => {
      return (
        !blocked.includes(form) &&
        prerequisites(form).every((dependencyId) => {
          return states[dependencyId]?.status === "saved";
        })
      );
    });

    if (!ready.length) {
      for (const form of pending) {
        states[form.id] = {
          ...states[form.id],
          status: "skipped",
          blockedBy: prerequisites(form),
        };
      }
      break;
    }

    const executable: FormInput[] = [];
    for (const form of ready) {
      const state = states[form.id];
      try {
        states[form.id] = {
          ...state,
          variables: getVariablesWithOverrides(form, state, responses, config.undoPayloads),
        };
        executable.push(form);
      } catch (error) {
        states[form.id] = getFailedState(state, "mapping", error);
      }
    }

    await runReadyForms(executable, states, responses, config, emit, maxConcurrency);
  }

  return { states, responses };
};

const normalizeConcurrency = (value: number | undefined) => {
  if (value === undefined || value === Infinity) {
    return Infinity;
  }

  const normalized = Math.max(1, Math.floor(value));

  return normalized;
};

const runReadyForms = async <P extends readonly AnyForm[]>(
  forms: readonly FormInput[],
  states: Record<string, FormState>,
  responses: Record<string, any>,
  config: SaveConfig<P>,
  emit: (phase: Phase, states: FormStates, responses: Responses) => void,
  maxConcurrency: number,
) => {
  let nextIndex = 0;
  const workerCount = Math.min(
    forms.length,
    Number.isFinite(maxConcurrency) ? maxConcurrency : forms.length,
  );

  const worker = async () => {
    while (true) {
      const form = forms[nextIndex++];
      if (!form) {
        return;
      }

      const retry = {
        maxRetries: 1,
        delayMs: 500,
        shouldRetry: isTransientError,
        ...config.retry,
        ...form.retry,
      };
      const initialState = states[form.id];
      let state: FormState;

      try {
        state = await saveFormWithRetry(
          form,
          initialState,
          retry,
          (progress) => {
            states[form.id] = progress;
            emit("saving", { ...states }, { ...responses });
          },
          config.progressDelayMs ?? 0,
        );
      } catch (error) {
        state = getFailedState(initialState, "save", error);
      }

      states[form.id] = state;
      if (state.status === "saved") {
        responses[form.id] = state.response;
      }
      emit("saving", { ...states }, { ...responses });
    }
  };

  await Promise.all(Array.from({ length: workerCount }, worker));
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
        Object.entries(states).map(([id, state]) => {
          return [id, { ...state }];
        }),
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
): FormState => {
  return {
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
  };
};

const refreshAndInvalidateCache = async <P extends readonly AnyForm[]>(
  successful: readonly FormInput[],
  config: SaveConfig<P>,
  queryClient: QueryClient,
): Promise<FollowUpError[]> => {
  const refreshAndCacheInvalidationErrors = [
    ...(await settleRefreshes(queryClient, [
      ...successful.map((form) => {
        return {
          refetchFunctions: form.refetchFunctions,
          invalidateQueryKeys: form.invalidateQueryKeys,
          formId: form.id,
        };
      }),
      config,
    ])),
  ];

  return refreshAndCacheInvalidationErrors;
};

const updateSkippedFormsState = (states: FormStates): FormStates => {
  return Object.fromEntries(
    Object.entries(states).map(([id, state]) => {
      return [id, state.status === "ready" ? { ...state, status: "skipped" } : state];
    }),
  );
};

const reconcileCacheWithMutationResponses = <P extends readonly AnyForm[]>(
  successful: readonly FormInput[],
  context: (form: FormInput) => {
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
