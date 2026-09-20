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
  const [orchestrator] = useState(() => {
    return createOrchestrator<T>(client, setState);
  });

  const latest = useRef(config);
  latest.current = config;

  useEffect(() => {
    const outcome = state.result?.outcome;
    if (outcome === "success" || outcome === "saved-with-follow-up-errors") {
      draft.clear();
    }
  }, [draft.clear, state.result?.outcome]);

  const submit = () => {
    const selectedForms = latest.current.includePristine
      ? latest.current.forms
      : latest.current.forms.filter((binding) => {
          return binding.form.state.isDirty;
        });

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

  const actionState = combineFormEditorActionStates(
    ...config.forms.map((form) => {
      return form.actionState ?? {
        canSubmit: true,
        isSubmitting: state.isSaving,
        isPristine: !form.form.state?.isDirty,
        validationErrors: [],
        submitErrors: [],
      };
    }),
  );

  const conductor = {
    ...state,
    isDirty,
    submit,
    reset,
    draft,
    actions: {
      ...actionState,
      isSubmitting: state.isSaving,
      onSubmit: submit,
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
