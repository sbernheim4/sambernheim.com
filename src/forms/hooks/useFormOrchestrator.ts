import { useRef, useState, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AnyForm, SaveConfig } from "../orchestration/types";
import { createOrchestrator, type SaveState } from "../orchestration/orchestrator";

type SavableForm = AnyForm & {
  form: {
    state: { isDirty: boolean };
    store: { subscribe: (listener: () => void) => { unsubscribe: () => void } };
  };
};

function useFormsDirty(forms: readonly SavableForm[], includePristine: boolean) {
  return useSyncExternalStore(
    (listener) => {
      const subscriptions = forms.map((binding) => binding.form.store.subscribe(listener));
      return () => {
        for (const subscription of subscriptions) {
          subscription.unsubscribe();
        }
      };
    },
    () => includePristine || forms.some((binding) => binding.form.state.isDirty),
    () => includePristine || forms.some((binding) => binding.form.state.isDirty),
  );
}

export function useFormOrchestrator<const T extends readonly SavableForm[]>(
  config: SaveConfig<T> & {
    includePristine?: boolean;
  },
) {
  const client = useQueryClient();
  const isDirty = useFormsDirty(config.forms, config.includePristine ?? false);

  const [state, setState] = useState<SaveState<T>>({
    phase: "idle",
    isSaving: false,
  });

  const [executor] = useState(() => createOrchestrator<T>(client, setState));

  const latest = useRef(config);

  latest.current = config;

  const submit = () => {
    const selectedForms = latest.current.includePristine
      ? latest.current.forms
      : latest.current.forms.filter((binding) => binding.form.state.isDirty);

    const forms = selectedForms as unknown as T;

    if (!forms.length) {
      return Promise.resolve(undefined);
    }

    const { includePristine: _includePristine, ...submitConfig } = latest.current;

    return executor.submit({
      ...submitConfig,
      forms,
    });
  };

  return {
    ...state,
    isDirty,
    submit,
    reset: executor.reset,
  };
}
