import { useRef, useState, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AnyForm, SaveConfig } from "../orchestration/types";
import { createOrchestrator, type SaveState } from "../orchestration/orchestrator";

type SavableForm = AnyForm & {
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
  },
) => {
  const client = useQueryClient();
  const isDirty = useFormsDirty(config.forms, config.includePristine ?? false);

  const [state, setState] = useState<SaveState<T>>({
    phase: "idle",
    isSaving: false,
  });
  const [orchestrator] = useState(() => {
    return createOrchestrator<T>(client, setState);
  });

  const latest = useRef(config);
  latest.current = config;

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

    const { includePristine: _includePristine, ...submitConfig } = latest.current;

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

    const submitConfig = latest.current;

    return orchestrator.reset({
      ...submitConfig,
      forms,
    });
  };

  const conductor = {
    ...state,
    isDirty,
    submit,
    reset,
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
