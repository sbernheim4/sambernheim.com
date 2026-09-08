import { useStore } from "@tanstack/react-form";

import type { FormEditorActionState } from "./useFormEditorContext";

export type FormEditorActionStatus = Omit<FormEditorActionState, "onSubmit">;

export const useFormActionState = (form: any): FormEditorActionStatus => {
  const canSubmit = useStore(form.store, (state: any) => {
    return state.canSubmit || (state.isFieldsValid && state.isValid);
  });
  const isSubmitting = useStore(form.store, (state: any) => state.isSubmitting);
  const isPristine = useStore(form.store, (state: any) => state.isDefaultValue);
  const validationError = useStore(form.store, (state: any) => state.errorMap.onDynamic);
  const submitError = useStore(form.store, (state: any) => state.errorMap.onSubmit);

  return {
    canSubmit,
    isSubmitting,
    isPristine,
    validationErrors: getErrors(validationError),
    submitErrors: submitError === undefined ? [] : [submitError],
  };
};

export const combineFormEditorActionStates = (
  ...states: FormEditorActionStatus[]
): FormEditorActionStatus => ({
  canSubmit: states.every((state) => state.canSubmit),
  isSubmitting: states.some((state) => state.isSubmitting),
  isPristine: states.every((state) => state.isPristine),
  validationErrors: states.flatMap((state) => state.validationErrors ?? []),
  submitErrors: states.flatMap((state) => state.submitErrors ?? []),
});

const getErrors = (error: unknown): string[] => {
  if (Array.isArray(error)) return error.filter((value): value is string => typeof value === "string");
  return typeof error === "string" ? [error] : [];
};
