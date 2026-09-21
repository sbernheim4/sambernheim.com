import type { FormInput } from "./types";
import { getFailedState, type FormStates } from "./state";

export const validateForms = async (
  forms: readonly FormInput[],
  states: FormStates,
): Promise<FormStates> => {
  const validated = await Promise.all(
    forms.map(async (form): Promise<[string, FormStates[string]]> => {
      const state = states[form.id];
      if (state.failure) {
        return [form.id, state];
      }
      try {
        const validation = await form.validate(structuredClone(state.formValues));
        return [
          form.id,
          validation.valid
            ? { ...state, status: "ready" }
            : getFailedState(state, "validation", validation.error),
        ];
      } catch (error) {
        return [form.id, getFailedState(state, "validation", error)];
      }
    }),
  );
  return Object.fromEntries(validated);
};

const getVariables = (
  form: FormInput,
  state: FormStates[string],
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

export const getVariablesWithOverrides = (
  form: FormInput,
  state: FormStates[string],
  responses: Readonly<Record<string, any>>,
  payloadOverrides?: Readonly<Record<string, unknown>>,
) => {
  if (payloadOverrides && Object.hasOwn(payloadOverrides, form.id)) {
    return structuredClone(payloadOverrides[form.id]);
  }
  return getVariables(form, state, responses);
};

export const prepareIndependentPayloads = (
  forms: readonly FormInput[],
  states: FormStates,
  payloadOverrides?: Readonly<Record<string, unknown>>,
): FormStates => {
  return Object.fromEntries(
    forms.map((form) => {
      const state = states[form.id];
      if (form.dependencies?.length) {
        return [form.id, state];
      }
      try {
        return [
          form.id,
          {
            ...state,
            variables: getVariablesWithOverrides(form, state, {}, payloadOverrides),
          },
        ];
      } catch (error) {
        return [form.id, getFailedState(state, "mapping", error)];
      }
    }),
  );
};
