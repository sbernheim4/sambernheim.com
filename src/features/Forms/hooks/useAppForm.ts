import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "../context";
import {
  AutocompleteField,
  TextField,
  SelectField,
  RadioGroupField,
  SubmitButton,
} from "../components/fields";

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    SelectField,
    RadioGroupField,
    AutocompleteField,
  },
  formComponents: {
    SubmitButton,
  },
});
