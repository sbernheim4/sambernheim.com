import type { QueryClient } from "@tanstack/react-query";
import type {
  AnyForm,
  CacheContext,
  CacheUpdate,
  FormInput,
  FormSaveState,
  FollowUpError,
  RefreshOptions,
  SaveConfig,
  SaveResult,
} from "./types";

export type EffectContext = CacheContext<any, any, any> & {
  formId?: string;
  formValues?: any;
  attempts?: number;
  followUpErrors?: FollowUpError[];
};

export type Effect = {
  phase: FollowUpError["phase"];
  formId?: string;
  run: () => unknown | Promise<unknown>;
};

export const executeSettledEffects = async (
  effects: readonly Effect[],
): Promise<FollowUpError[]> => {
  const settled = await Promise.allSettled(
    effects.map(async (effect) => {
      const value = await effect.run();
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
  return settled.flatMap((entry, index) => {
    return entry.status === "rejected"
      ? [{ phase: effects[index].phase, formId: effects[index].formId, error: entry.reason }]
      : [];
  });
};

export const executeOrderedEffects = async (
  effects: readonly Effect[],
): Promise<FollowUpError[]> => {
  const errors: FollowUpError[] = [];
  for (const effect of effects) {
    try {
      await effect.run();
    } catch (error) {
      errors.push({ phase: effect.phase, formId: effect.formId, error });
    }
  }
  return errors;
};

export const settleRefreshes = async (
  queryClient: QueryClient,
  sources: readonly (RefreshOptions & { formId?: string })[],
): Promise<FollowUpError[]> => {
  const queue: Effect[] = sources.flatMap((source) => {
    return [
      ...(source.invalidateQueryKeys ?? []).map((queryKey) => {
        return {
          phase: "refresh" as const,
          formId: source.formId,
          run: () => {
            return queryClient.invalidateQueries(
              { queryKey },
              { cancelRefetch: false, throwOnError: true },
            );
          },
        };
      }),
      ...(source.refetchFunctions ?? []).map((run) => {
        return { phase: "refresh" as const, formId: source.formId, run };
      }),
    ];
  });

  return executeSettledEffects(queue);
};

export const refreshAndInvalidateCache = async <P extends readonly AnyForm[]>(
  successful: readonly FormInput[],
  config: SaveConfig<P>,
  queryClient: QueryClient,
) => {
  return settleRefreshes(queryClient, [
    ...successful.map((form) => {
      return {
        refetchFunctions: form.refetchFunctions,
        invalidateQueryKeys: form.invalidateQueryKeys,
        formId: form.id,
      };
    }),
    config,
  ]);
};

export const updateCacheWithMutationResponse = (
  context: EffectContext,
  cacheUpdates: readonly CacheUpdate<any, any, any>[] = [],
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

export const reconcileCacheWithMutationResponses = <P extends readonly AnyForm[]>(
  successful: readonly FormInput[],
  context: (form: FormInput) => EffectContext,
  result: SaveResult<P>,
  queryClient: QueryClient,
  config: SaveConfig<P>,
) => {
  return [
    ...successful.flatMap((form) => {
      return updateCacheWithMutationResponse(
        context(form),
        form.cacheUpdates as readonly CacheUpdate<any, any, any>[] | undefined,
        form.id,
      );
    }),
    ...updateCacheWithMutationResponse(
      { queryClient, response: result.responses, variables: undefined, results: result.responses },
      config.cacheUpdates as readonly CacheUpdate<any, any, any>[] | undefined,
    ),
  ];
};

export const markFormsSaved = async (
  forms: readonly FormInput[],
  states: Readonly<Record<string, FormSaveState<any, any, any>>>,
) => {
  return executeOrderedEffects(
    forms.map((form) => {
      return {
        phase: "form-state" as const,
        formId: form.id,
        run: () => {
          return form.markSaved?.(structuredClone(states[form.id].formValues));
        },
      };
    }),
  );
};

export const invokeFormCallbacks = async (
  forms: readonly FormInput[],
  states: Readonly<Record<string, FormSaveState<any, any, any>>>,
  context: (form: FormInput) => EffectContext,
) => {
  return executeOrderedEffects(
    forms.map((form) => {
      return {
        phase: "effect" as const,
        formId: form.id,
        run: () => {
          if (states[form.id].status === "saved") {
            return form.onSuccess?.(context(form));
          }
          if (states[form.id].failure) {
            return form.onFailure?.(states[form.id].failure);
          }
        },
      };
    }),
  );
};

export const invokeConfigCallbacks = async <P extends readonly AnyForm[]>(
  allSaved: boolean,
  config: SaveConfig<P>,
  result: SaveResult<P>,
) => {
  return executeOrderedEffects([
    {
      phase: "effect",
      run: () => {
        return (allSaved ? config.onSuccess : config.onFailure)?.({ result });
      },
    },
  ]);
};

export const invokeFormFinish = (forms: readonly FormInput[]) => {
  return executeOrderedEffects(
    forms.map((form) => {
      return {
        phase: "form-state" as const,
        formId: form.id,
        run: () => {
          return form.finish?.();
        },
      };
    }),
  );
};
