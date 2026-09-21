import { useCallback, useMemo, useState, type FormEvent } from "react";
import * as Tabs from "@radix-ui/react-tabs";

import { EditContext } from "../context";
import { FormEditorContext, type FormEditorController } from "../hooks/useFormEditorContext";
import type { FormEditorProviderProps } from "./formTypes";

export const FormEditorProvider = ({
  mode,
  defaultTab,
  children,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  isEditing = mode === "edit",
  onStartEditing,
  onCancel,
  readOnly = false,
  preventSaveWithoutChanges = mode === "edit",
  saveLabel = "Save changes",
  saveButtonVariant = "save",
  cancelLabel = "Cancel",
  cancelButtonVariant = "cancel",
  showCancel = true,
  actions,
}: FormEditorProviderProps) => {
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(defaultTab);
  const activeTab = controlledActiveTab ?? uncontrolledActiveTab;

  const setActiveTab = useCallback(
    (tab: string) => {
      onActiveTabChange?.(tab);
      if (!controlledActiveTab) {
        setUncontrolledActiveTab(tab);
      }
    },
    [controlledActiveTab, onActiveTabChange],
  );
  const startEditing = useCallback(() => {
    onStartEditing?.();
  }, [onStartEditing]);
  const cancelEditing = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const controller = useMemo<FormEditorController>(
    () => ({
      mode,
      activeTab,
      isEditing,
      readOnly,
      preventSaveWithoutChanges,
      saveLabel,
      saveButtonVariant,
      cancelLabel,
      cancelButtonVariant,
      showCancel,
      actions,
      setActiveTab,
      startEditing,
      cancelEditing,
    }),
    [
      mode,
      activeTab,
      isEditing,
      readOnly,
      preventSaveWithoutChanges,
      saveLabel,
      saveButtonVariant,
      cancelLabel,
      cancelButtonVariant,
      showCancel,
      actions,
      setActiveTab,
      startEditing,
      cancelEditing,
    ],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!readOnly && isEditing) {
      actions.onSubmit();
    }
  };

  return (
    <EditContext.Provider value={{ isEditing }}>
      <FormEditorContext.Provider value={controller}>
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} asChild>
          <form onSubmit={handleSubmit} aria-busy={actions.isSubmitting}>
            {children}
          </form>
        </Tabs.Root>
      </FormEditorContext.Provider>
    </EditContext.Provider>
  );
};
