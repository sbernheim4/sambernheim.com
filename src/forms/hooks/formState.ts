import { evaluate, type AnyFormApi } from "@tanstack/form-core";

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
