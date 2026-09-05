import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AnyForm, SaveConfig } from "../orchestration/types";
import { createOrchestrator, type SaveState } from "../orchestration/orchestrator";

type SavableForm = AnyForm & {
  form: { state: { isDirty: boolean } };
};

export function useFormOrchestrator<const T extends readonly SavableForm[]>(
  config: SaveConfig<T> & {
    includePristine?: boolean;
  },
) {
  const client = useQueryClient();

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
    submit,
    reset: executor.reset,
  };
}
