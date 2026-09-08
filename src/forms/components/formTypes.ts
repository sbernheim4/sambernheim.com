import type { ReactNode } from "react";
import type { FormEditorActionState, FormEditorController } from "../hooks/useFormEditorContext";

export type FormEditorProviderProps = {
  mode: FormEditorController["mode"];
  defaultTab: string;
  children: ReactNode;
  tabQueryKey?: string;
  onCancel?: () => void;
  readOnly?: boolean;
  preventSaveWithoutChanges?: boolean;
  saveLabel?: string;
  saveButtonVariant?: FormEditorController["saveButtonVariant"];
  cancelLabel?: string;
  cancelButtonVariant?: FormEditorController["cancelButtonVariant"];
  showCancel?: boolean;
  editQueryKey?: string;
  actions: FormEditorActionState;
};

export type FormEditorRegionProps = {
  children: ReactNode;
  className?: string;
};
