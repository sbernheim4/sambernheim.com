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

export const settleRefreshes = async (
  queryClient: QueryClient,
  sources: readonly (RefreshOptions & { formId?: string })[],
): Promise<FollowUpError[]> => {
  const queue = sources.flatMap((source) => {
    return [
      ...(source.invalidateQueryKeys ?? []).map((queryKey) => {
        return {
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
        return { formId: source.formId, run };
      }),
    ];
  });

  const settled = await Promise.allSettled(
    queue.map(async ({ run }) => {
      const value = await run();
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
      ? [{ phase: "refresh" as const, formId: queue[index].formId, error: entry.reason }]
      : [];
  });
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

export const invokeFormCallbacks = async (
  forms: readonly FormInput[],
  states: Readonly<Record<string, FormSaveState<any, any, any>>>,
  context: (form: FormInput) => EffectContext,
) => {
  const errors: FollowUpError[] = [];
  for (const form of forms) {
    try {
      if (states[form.id].status === "saved") {
        await form.onSuccess?.(context(form));
      } else if (states[form.id].failure) {
        await form.onFailure?.(states[form.id].failure);
      }
    } catch (error) {
      errors.push({ phase: "effect", formId: form.id, error });
    }
  }
  return errors;
};

export const invokeConfigCallbacks = async <P extends readonly AnyForm[]>(
  allSaved: boolean,
  config: SaveConfig<P>,
  result: SaveResult<P>,
) => {
  try {
    await (allSaved ? config.onSuccess : config.onFailure)?.({ result });
    return [];
  } catch (error) {
    return [{ phase: "effect" as const, error }];
  }
};

export const invokeFormFinish = (forms: readonly FormInput[]) => {
  const errors: FollowUpError[] = [];
  for (const form of forms) {
    try {
      form.finish?.();
    } catch (error) {
      errors.push({ phase: "form-state", formId: form.id, error });
    }
  }
  return errors;
};
