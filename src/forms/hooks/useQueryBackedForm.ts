import type { AsyncMutation } from "../orchestration/types";
import { useFormOrchestrator } from "./useFormOrchestrator";
import { useComposableForm, type FormOptions } from "./useComposableForm";

export type QueryBackedFormConfig<QueryData, Values, Mutation extends AsyncMutation> = FormOptions<
  QueryData,
  Values,
  Mutation
>;

export function useQueryBackedForm<QueryData, Values, Mutation extends AsyncMutation>(
  config: QueryBackedFormConfig<QueryData, Values, Mutation>,
) {
  const binding = useComposableForm<"resource", QueryData, Values, Mutation>(
    Object.assign({}, config, { id: "resource" as const }),
  );

  const save = useFormOrchestrator({
    forms: [binding] as const,
    includePristine: true,
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
    error,
  };
}
