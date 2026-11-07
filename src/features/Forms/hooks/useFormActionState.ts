import { useStore } from "@tanstack/react-form";
import type { AnyFormApi } from "@tanstack/form-core";

import type { FormEditorActionState } from "./useFormEditorContext";

export type FormEditorActionStatus = Omit<FormEditorActionState, "onSubmit">;

export const useFormActionState = (form: AnyFormApi): FormEditorActionStatus => {
  const canSubmit = useStore(form.store, (state) => {
    return state.canSubmit || (state.isFieldsValid && state.isValid);
  });
  const isSubmitting = useStore(form.store, (state) => {
    return state.isSubmitting;
  });
  const isPristine = useStore(form.store, (state) => {
    return state.isDefaultValue;
  });
  const validationError = useStore(form.store, (state) => {
    return state.errorMap.onDynamic;
  });
  const submitError = useStore(form.store, (state) => {
    return state.errorMap.onSubmit;
  });

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
): FormEditorActionStatus => {
  return {
    canSubmit: states.every((state) => {
      return state.canSubmit;
    }),
    isSubmitting: states.some((state) => {
      return state.isSubmitting;
    }),
    isPristine: states.every((state) => {
      return state.isPristine;
    }),
    validationErrors: states.flatMap((state) => {
      return state.validationErrors ?? [];
    }),
    submitErrors: states.flatMap((state) => {
      return state.submitErrors ?? [];
    }),
  };
};

const getErrors = (error: unknown): string[] => {
  if (Array.isArray(error)) {
    return error.filter((value): value is string => {
      return typeof value === "string";
    });
  }
  return typeof error === "string" ? [error] : [];
};
