import { createFormHookContexts } from "@tanstack/react-form";
import { createContext } from "react";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const EditContext = createContext({ isEditing: false });
