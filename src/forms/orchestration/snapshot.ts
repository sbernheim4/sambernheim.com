import type { FormInput } from "./types";
import { getFailedState, type FormState, type FormStates } from "./state";

export const snapshotForms = (
  forms: readonly FormInput[],
  formValueOverrides?: Readonly<Record<string, unknown>>,
): FormStates => {
  return Object.fromEntries(
    forms.map((form) => {
      const initial: FormState = { formId: form.id, status: "validating", attempts: 0 };
      try {
        const formValues =
          formValueOverrides && Object.hasOwn(formValueOverrides, form.id)
            ? formValueOverrides[form.id]
            : form.snapshot();
        return [form.id, { ...initial, formValues: structuredClone(formValues) }];
      } catch (error) {
        return [form.id, getFailedState(initial, "validation", error)];
      }
    }),
  );
};

export const captureUndoState = (forms: readonly FormInput[]) => {
  const formValues: Record<string, unknown> = {};
  const responses: Record<string, unknown> = {};

  try {
    for (const form of forms) {
      const values = form.undoSnapshot?.();
      if (values === undefined) {
        return undefined;
      }
      formValues[form.id] = structuredClone(values);
      const response = form.undoResponse?.();
      if (response !== undefined) {
        responses[form.id] = structuredClone(response);
      }
    }

    const payloads: Record<string, unknown> = {};
    const remaining = new Set(
      forms.map(({ id }) => {
        return id;
      }),
    );
    while (remaining.size) {
      const ready = forms.filter((form) => {
        return (
          remaining.has(form.id) &&
          (form.dependencies ?? []).every(({ id }) => {
            return Object.hasOwn(payloads, id);
          })
        );
      });
      if (!ready.length) {
        return undefined;
      }
      for (const form of ready) {
        const state: FormState = {
          formId: form.id,
          status: "ready",
          attempts: 0,
          formValues: formValues[form.id],
        };
        payloads[form.id] = getVariables(form, state, responses);
        remaining.delete(form.id);
      }
    }
    return { formValues, payloads };
  } catch {
    return undefined;
  }
};

const getVariables = (
  form: FormInput,
  state: FormState,
  responses: Readonly<Record<string, any>>,
) => {
  return structuredClone(
    form.toMutationPayload
      ? form.toMutationPayload(structuredClone(state.formValues), {
          results: structuredClone(responses),
        })
      : state.formValues,
  );
};
