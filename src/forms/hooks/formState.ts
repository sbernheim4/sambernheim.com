import { FormApi, FieldApi, evaluate, type AnyFormApi } from "@tanstack/form-core";
import type { ValidationResult } from "../orchestration/types.ts";

/** Validate a detached snapshot, so async validators cannot observe later edits. */
export async function validateSnapshot(
  form: AnyFormApi,
  values: unknown,
): Promise<ValidationResult> {
  const shadow = new FormApi({
    ...form.options,
    defaultValues: structuredClone(values),
    defaultState: undefined,
    onSubmit: undefined,
    listeners: undefined,
  });
  const unmounts = [shadow.mount()];
  for (const info of Object.values(form.fieldInfo)) {
    if (!info?.instance) continue;
    const field = new FieldApi({
      ...info.instance.options,
      form: shadow,
      defaultValue: undefined,
      listeners: undefined,
    });
    unmounts.push(field.mount());
  }
  try {
    await shadow.validateAllFields("submit");
    await shadow.validate("submit");
    if (evaluate(form.state.values, values)) {
      form.setErrorMap(shadow.state.errorMap);
      for (const [name, meta] of Object.entries(shadow.state.fieldMeta)) {
        if (!meta) continue;
        form.setFieldMeta(name, (previous) => ({
          ...previous,
          isTouched: true,
          errorMap: meta.errorMap,
          errorSourceMap: meta.errorSourceMap,
        }));
      }
    }
    return shadow.state.isValid
      ? { valid: true }
      : {
          valid: false,
          error: new Error("Please correct the highlighted fields."),
        };
  } finally {
    for (const unmount of unmounts.reverse()) unmount();
  }
}

/** Reset TanStack's values/defaults and keep its React facade in sync. */
export function resetFormValues(form: AnyFormApi, values: unknown) {
  const defaults = structuredClone(values);
  form.reset(defaults);
  form.options = { ...form.options, defaultValues: defaults };
}

export function markFormSaved(form: AnyFormApi, values: unknown) {
  const current = form.state.values;
  const meta = form.baseStore.state.fieldMetaBase;
  const changed = !evaluate(current, values);
  resetFormValues(form, values);

  if (changed) {
    form.baseStore.setState((state) => ({
      ...state,
      values: current,
      fieldMetaBase: meta,
    }));
  }
}
