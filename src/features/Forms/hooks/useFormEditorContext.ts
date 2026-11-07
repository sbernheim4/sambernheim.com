import type { QueryKey } from "@tanstack/react-query";
import { createContext, useContext } from "react";

export type FormEditorMode = "create" | "edit";

export type FormEditorActionState = {
  onSubmit: () => void | Promise<unknown>;
  isSubmitting: boolean;
  isPristine: boolean;
  canSubmit: boolean;
  validationErrors?: string[];
  submitErrors?: unknown[];
  orchestrator?: FormEditorOrchestrator;
};

export type FormEditorOrchestrator = {
  correlationId: string;
  timestamp: number;
  phase: string;
  isSubmitting: boolean;
  forms: readonly {
    id: string;
    invalidateQueryKeys: readonly QueryKey[];
    refetchCount: number;
    cacheUpdateCount: number;
  }[];
  result?: {
    forms: Readonly<
      Record<
        string,
        {
          status: string;
          attempts: number;
          blockedBy?: readonly string[];
          failure?: { phase: string; error: unknown };
        }
      >
    >;
    followUpErrors: readonly { phase: string; formId?: string; error: unknown }[];
  };
  progressDelayMs: number;
  isOpen: boolean;
  setProgressDelayMs: (value: number) => void;
  close: () => void | Promise<void>;
};

export type FormEditorController = {
  mode: FormEditorMode;
  viewMode: "tabs" | "page" | "sidebar";
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
