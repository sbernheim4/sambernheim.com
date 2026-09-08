import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import * as Tabs from "@radix-ui/react-tabs";

import { EditContext } from "../EditContext";
import { FormEditorContext, type FormEditorController } from "../hooks/useFormEditorContext";
import type { FormEditorProviderProps } from "./formTypes";

const readQueryValue = (key: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(key) || fallback;
};

const writeQueryValue = (key: string, value: string | null) => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (value === null) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
  window.history.replaceState({}, "", url);
};

export const FormEditorProvider = ({
  mode,
  defaultTab,
  children,
  tabQueryKey = "tab",
  onCancel,
  readOnly = false,
  preventSaveWithoutChanges = mode === "edit",
  saveLabel = "Save changes",
  saveButtonVariant = "save",
  cancelLabel = "Cancel",
  cancelButtonVariant = "cancel",
  showCancel = true,
  editQueryKey = "edit",
  actions,
}: FormEditorProviderProps) => {
  const [activeTab, setActiveTabState] = useState(() => readQueryValue(tabQueryKey, defaultTab));
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    setActiveTabState(readQueryValue(tabQueryKey, defaultTab));
  }, [defaultTab, tabQueryKey]);

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    writeQueryValue(tabQueryKey, tab);
  }, [tabQueryKey]);
  const startEditing = useCallback(() => {
    setIsEditing(true);
    writeQueryValue(editQueryKey, "true");
  }, [editQueryKey]);
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    writeQueryValue(editQueryKey, null);
    onCancel?.();
  }, [editQueryKey, onCancel]);

  const controller = useMemo<FormEditorController>(() => ({
    mode, activeTab, isEditing, readOnly, preventSaveWithoutChanges,
    saveLabel, saveButtonVariant, cancelLabel, cancelButtonVariant, showCancel,
    actions, setActiveTab, startEditing, cancelEditing,
  }), [mode, activeTab, isEditing, readOnly, preventSaveWithoutChanges, saveLabel,
    saveButtonVariant, cancelLabel, cancelButtonVariant, showCancel, actions,
    setActiveTab, startEditing, cancelEditing]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!readOnly && isEditing) void actions.onSubmit();
  };

  return (
    <EditContext.Provider value={{ isEditing }}>
      <FormEditorContext.Provider value={controller}>
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} asChild>
          <form onSubmit={handleSubmit} aria-busy={actions.isSubmitting}>{children}</form>
        </Tabs.Root>
      </FormEditorContext.Provider>
    </EditContext.Provider>
  );
};
