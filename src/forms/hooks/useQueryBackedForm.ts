import type { AsyncMutation } from "../orchestration/types";
import { useSelector } from "@tanstack/react-form";
import { useFormOrchestrator } from "./useFormOrchestrator";
import { useComposableForm, type FormOptions } from "./useComposableForm";

export type QueryBackedFormConfig<QueryData, Values, Mutation extends AsyncMutation> = FormOptions<
  QueryData,
  Values,
  Mutation
> & { persistDraftKey?: string };

export const useQueryBackedForm = <QueryData, Values, Mutation extends AsyncMutation>(
  config: QueryBackedFormConfig<QueryData, Values, Mutation>,
) => {
  const binding = useComposableForm<"resource", QueryData, Values, Mutation>(
    Object.assign({}, config, { id: "resource" as const }),
  );

  const save = useFormOrchestrator({
    forms: [binding] as const,
    includePristine: true,
    persistDraftKey: config.persistDraftKey,
  });
  const isDirty = useSelector(binding.form.store, (state) => {
    return state.isDirty;
  });

  // The orchestrator awaits native TanStack validation before executing writes.
  binding.form.handleSubmit = async () => {
    await save.submit();
  };

  const failure = save.result?.forms.resource?.failure?.error ?? binding.readError;

  const error =
    failure == null ? null : failure instanceof Error ? failure : new Error(String(failure));

  return {
    ...binding,
    save: save.submit,
    result: save.result,
    submit: save.submit,
    isSaving: save.isSaving,
    isDirty,
    actions: save.actions,
    reset: save.reset,
    draft: save.draft,
    allowPristineSave: config.query === undefined,
    error,
  };
};
