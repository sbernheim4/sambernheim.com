import { createFormHookContexts } from "@tanstack/react-form";
import { createContext } from "react";

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export const EditContext = createContext({ isEditing: false });
