import type { ReactNode } from "react";
import type { FormEditorActionState, FormEditorController } from "../hooks/useFormEditorContext";

export type FormEditorProviderProps = {
  mode: FormEditorController["mode"];
  defaultTab: string;
  children: ReactNode;
  activeTab?: string;
  onActiveTabChange?: (tab: string) => void;
  isEditing?: boolean;
  onStartEditing?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
  preventSaveWithoutChanges?: boolean;
  saveLabel?: string;
  saveButtonVariant?: FormEditorController["saveButtonVariant"];
  cancelLabel?: string;
  cancelButtonVariant?: FormEditorController["cancelButtonVariant"];
  showCancel?: boolean;
  actions: FormEditorActionState;
};

export type FormEditorRegionProps = {
  children: ReactNode;
  className?: string;
};
