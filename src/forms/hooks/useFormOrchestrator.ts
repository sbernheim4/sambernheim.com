import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AnyForm, SaveConfig } from "../orchestration/types";
import { createOrchestrator, type SaveState } from "../orchestration/orchestrator";
import { combineFormEditorActionStates, type FormEditorActionStatus } from "./useFormActionState";
import { usePersistedFormData, type PersistedFormBinding } from "./usePersistedFormData";

type SavableForm = AnyForm & {
  actionState?: FormEditorActionStatus;
  form: {
    state: {
      isDirty: boolean;
    };
    store: {
      subscribe: (listener: () => void) => {
        unsubscribe: () => void;
      };
    };
  };
};

const useFormsDirty = (forms: readonly SavableForm[], includePristine: boolean) => {
  return useSyncExternalStore(
    (listener) => {
      const subscriptions = forms.map((binding) => {
        return binding.form.store.subscribe(listener);
      });
      return () => {
        for (const subscription of subscriptions) {
          subscription.unsubscribe();
        }
      };
    },
    () => {
      return (
        includePristine ||
        forms.some((binding) => {
          return binding.form.state.isDirty;
        })
      );
    },
    () => {
      return (
        includePristine ||
        forms.some((binding) => {
          return binding.form.state.isDirty;
        })
      );
    },
  );
};

export const useFormOrchestrator = <const T extends readonly SavableForm[]>(
  config: SaveConfig<T> & {
    includePristine?: boolean;
    persistDraftKey?: string;
  },
) => {
  const client = useQueryClient();
  const isDirty = useFormsDirty(config.forms, config.includePristine ?? false);
  const draft = usePersistedFormData({
    storageKey: config.persistDraftKey,
    forms: config.forms as unknown as readonly PersistedFormBinding[],
  });

  const [state, setState] = useState<SaveState<T>>({
    phase: "idle",
    isSaving: false,
  });
  const [progressDelayMs, setProgressDelayMs] = useState(config.progressDelayMs ?? 0);
  const [progressOpen, setProgressOpen] = useState(false);
  const [orchestrator] = useState(() => {
    return createOrchestrator<T>(client, setState);
  });

  const latest = useRef(config);
  latest.current = { ...config, progressDelayMs };

  useEffect(() => {
    const outcome = state.result?.outcome;
    if (outcome === "success" || outcome === "saved-with-follow-up-errors") {
      draft.clear();
    }
  }, [draft.clear, state.result?.outcome]);

  const submit = () => {
    if (progressDelayMs > 0) {
      setProgressOpen(true);
    }

    const allForms = latest.current.forms;
    const selectedIds = new Set(
      latest.current.includePristine
        ? allForms.map((binding) => binding.id)
        : allForms.filter((binding) => binding.form.state.isDirty).map((binding) => binding.id),
    );

    // A dirty form must bring its declared dependencies into the save set so
    // the orchestrator can validate and save them in dependency order.
    let changed = true;
    while (changed) {
      changed = false;
      for (const binding of allForms) {
        if (!selectedIds.has(binding.id)) {
          continue;
        }
        for (const dependency of binding.dependencies ?? []) {
          if (!selectedIds.has(dependency.id)) {
            selectedIds.add(dependency.id);
            changed = true;
          }
        }
      }
    }

    const selectedForms = allForms.filter((binding) => selectedIds.has(binding.id));

    const forms = selectedForms as unknown as T;

    if (!forms.length) {
      return Promise.resolve(undefined);
    }

    const {
      includePristine: _includePristine,
      persistDraftKey: _persistDraftKey,
      ...submitConfig
    } = latest.current;

    return orchestrator.submit({
      ...submitConfig,
      forms,
    });
  };

  const reset = () => {
    const allForms = latest.current.forms;
    const forms = allForms as unknown as T;

    if (!forms.length) {
      return Promise.resolve(undefined);
    }

    const { persistDraftKey: _persistDraftKey, ...submitConfig } = latest.current;

    return orchestrator.reset({
      ...submitConfig,
      forms,
    });
  };

  const closeProgress = () => {
    setProgressOpen(false);

    return latest.current.onProgressClose?.();
  };

  const actionState = combineFormEditorActionStates(
    ...config.forms.map((form) => {
      return (
        form.actionState ?? {
          canSubmit: true,
          isSubmitting: state.isSaving,
          isPristine: !form.form.state?.isDirty,
          validationErrors: [],
          submitErrors: [],
        }
      );
    }),
  );

  const orchestratorProgress = {
    phase: state.phase,
    isSubmitting: state.isSaving,
    forms: config.forms.map((form) => {
      return {
        id: form.id,
        invalidateQueryKeys: form.invalidateQueryKeys ?? [],
        refetchCount: form.refetchFunctions?.length ?? 0,
        cacheUpdateCount: form.cacheUpdates?.length ?? 0,
      };
    }),
    result: state.result,
    progressDelayMs,
    isOpen: progressOpen,
    setProgressDelayMs,
    close: closeProgress,
  };

  const conductor = {
    ...state,
    isDirty,
    orchestratorProgress,
    submit,
    reset,
    draft,
    actions: {
      ...actionState,
      isSubmitting: state.isSaving,
      onSubmit: submit,
      orchestrator: orchestratorProgress,
    },
    // This provider object is so this hook composes nicely with the Form UI
    // component
    provider: {
      handleSubmit: () => {
        return submit();
      },
      reset: () => {
        return reset();
      },
    },
  };

  return conductor;
};
