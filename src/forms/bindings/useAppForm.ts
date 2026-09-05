import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "../context";
import { TextField, SelectField, RadioGroupField, SubmitButton } from "../ui/fields";

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    SelectField,
    RadioGroupField,
  },
  formComponents: {
    SubmitButton,
  },
});
