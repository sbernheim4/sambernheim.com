import type { ReactNode } from "react";

export type Option<TValue extends string = string> = { value: TValue; label: string };
export type TextFieldProps = {
  label: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (value: string) => void;
};
export type SelectFieldProps<TValue extends string> = {
  label: string;
  options: ReadonlyArray<Option<TValue>>;
  placeholder?: string;
  onChange?: (value: TValue) => void;
};
export type AutocompleteFieldProps<TValue extends string> = {
  label: string;
  options: ReadonlyArray<Option<TValue>>;
  placeholder?: string;
};
export type RadioGroupFieldProps<TValue extends string> = {
  label: string;
  options: ReadonlyArray<Option<TValue>>;
  onChange?: (value: TValue) => void;
};
export type SubmitButtonProps = { label: string; isSaving: boolean };
export type FieldPrimitives = {
  TextField: (props: TextFieldProps) => ReactNode;
  SelectField: <TValue extends string>(props: SelectFieldProps<TValue>) => ReactNode;
  AutocompleteField: <TValue extends string>(props: AutocompleteFieldProps<TValue>) => ReactNode;
  RadioGroupField: <TValue extends string>(props: RadioGroupFieldProps<TValue>) => ReactNode;
  SubmitButton: (props: SubmitButtonProps) => ReactNode;
};
