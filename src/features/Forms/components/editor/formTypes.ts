import type { ReactNode } from "react";
import type { ComponentType } from "react";
import type { CommandOverride } from "@features/CommandPalette/model";
import type { FormEditorActionState, FormEditorController } from "../../hooks/useFormEditorContext";

export type FormEditorProviderProps = {
  mode: FormEditorController["mode"];
  defaultTab: string;
  viewMode?: "tabs" | "page" | "sidebar";
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

export type FormEditorActionsProps = {
  saveCommand?: CommandOverride;
  cancelCommand?: CommandOverride;
};

export type FormEditorTabProps = { name: string; label?: string; children: ReactNode };

export type FormEditorTabTriggerProps = {
  name: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
};
