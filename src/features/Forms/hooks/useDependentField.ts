import { useSelector } from "@tanstack/react-form";
import type { DeepKeys, DeepValue } from "@tanstack/form-core";

type FormState<Values> = {
  values: Values;
};

type FormLike<Values> = {
  store: {
    get: () => FormState<Values>;
    subscribe: (listener: (value: FormState<Values>) => void) => { unsubscribe: () => void };
  };
  getFieldValue: <Field extends DeepKeys<Values>>(field: Field) => DeepValue<Values, Field>;
  setFieldValue: <Field extends DeepKeys<Values>>(
    field: Field,
    value: DeepValue<Values, Field>,
  ) => void;
};

export type DependentFieldOptions<
  SourceValues,
  SourceValue,
  TargetValues,
  TargetField extends DeepKeys<TargetValues>,
> = {
  source: FormLike<SourceValues>;
  select: (values: SourceValues) => SourceValue;
  target: FormLike<TargetValues>;
  targetField: TargetField;
  format: (
    sourceValue: SourceValue,
    currentTargetValue: DeepValue<TargetValues, TargetField>,
  ) => DeepValue<TargetValues, TargetField>;
};

export const useDependentField = <
  SourceValues,
  SourceValue,
  TargetValues,
  const TargetField extends DeepKeys<TargetValues>,
>(
  options: DependentFieldOptions<SourceValues, SourceValue, TargetValues, TargetField>,
) => {
  const value = useSelector(options.source.store, (state) => {
    return options.select(state.values);
  });

  const onChange = (nextSourceValue: SourceValue) => {
    const currentTargetValue = options.target.getFieldValue(options.targetField);
    const nextTargetValue = options.format(nextSourceValue, currentTargetValue);
    options.target.setFieldValue(options.targetField, nextTargetValue);
  };

  return { value, onChange };
};
