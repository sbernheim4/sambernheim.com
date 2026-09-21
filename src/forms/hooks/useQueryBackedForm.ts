import type { AsyncMutation } from "../orchestration/types";
import { useMemo } from "react";
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

  // Keep the TanStack form instance immutable during render while exposing the
  // orchestrated submit behavior through the returned form facade.
  const form = useMemo(() => {
    return new Proxy(binding.form, {
      get(target, property, receiver) {
        if (property === "handleSubmit") {
          return async () => {
            await save.submit();
          };
        }
        return Reflect.get(target, property, receiver);
      },
    });
  }, [binding.form, save.submit]);

  const failure = save.result?.forms.resource?.failure?.error ?? binding.readError;

  const error =
    failure == null ? null : failure instanceof Error ? failure : new Error(String(failure));

  return {
    ...binding,
    form,
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
