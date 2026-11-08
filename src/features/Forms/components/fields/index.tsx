import { createContext, useContext } from "react";
import type {
  AutocompleteFieldProps,
  FieldPrimitives,
  RadioGroupFieldProps,
  SelectFieldProps,
  SubmitButtonProps,
  TextFieldProps,
} from "./types";

export const FieldPrimitivesContext = createContext<FieldPrimitives | null>(null);
const useFieldPrimitives = () => {
  const primitives = useContext(FieldPrimitivesContext);
  if (!primitives) {
    throw new Error("FieldPrimitivesContext provider is missing");
  }
  return primitives;
};
export const TextField = (props: TextFieldProps) => {
  const { TextField: Field } = useFieldPrimitives();
  return <Field {...props} />;
};
export const SelectField = <TValue extends string>(props: SelectFieldProps<TValue>) => {
  const { SelectField: Field } = useFieldPrimitives();
  return <Field {...props} />;
};
export const AutocompleteField = <TValue extends string>(props: AutocompleteFieldProps<TValue>) => {
  const { AutocompleteField: Field } = useFieldPrimitives();
  return <Field {...props} />;
};
export const RadioGroupField = <TValue extends string>(props: RadioGroupFieldProps<TValue>) => {
  const { RadioGroupField: Field } = useFieldPrimitives();
  return <Field {...props} />;
};
export const SubmitButton = (props: SubmitButtonProps) => {
  const { SubmitButton: Button } = useFieldPrimitives();
  return <Button {...props} />;
};
