import { createContext, useContext } from "react";

export type FormEditorMode = "create" | "edit";

export type FormEditorActionState = {
  onSubmit: () => void | Promise<unknown>;
  isSubmitting: boolean;
  isPristine: boolean;
  canSubmit: boolean;
  validationErrors?: string[];
  submitErrors?: unknown[];
};

export type FormEditorController = {
  mode: FormEditorMode;
  viewMode: "tabs" | "page";
  activeTab: string;
  isEditing: boolean;
  readOnly?: boolean;
  preventSaveWithoutChanges?: boolean;
  saveLabel?: string;
  saveButtonVariant?: "save" | "next";
  cancelLabel?: string;
  cancelButtonVariant?: "cancel" | "previous";
  showCancel?: boolean;
  actions: FormEditorActionState;
  setActiveTab: (tab: string) => void;
  startEditing: () => void;
  cancelEditing: () => void;
};

export const FormEditorContext = createContext<FormEditorController | null>(null);

export const useFormEditorContext = () => {
  const context = useContext(FormEditorContext);
  if (!context) {
    throw new Error("FormEditor components must be rendered inside FormEditor.Provider.");
  }
  return context;
};
