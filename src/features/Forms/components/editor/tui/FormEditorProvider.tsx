import { useCallback, useMemo, useState } from "react";
import { Box } from "ink";
import { EditContext } from "../../../context";
import { FormEditorContext, type FormEditorController } from "../../../hooks/useFormEditorContext";
import { FieldFocusProvider } from "../../fields/tui/FieldFocus";
import type { FormEditorProviderProps } from "../formTypes";

export const FormEditorProvider = ({
  mode,
  defaultTab,
  viewMode = "tabs",
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
      if (controlledActiveTab === undefined) {
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
  const controller = useMemo<FormEditorController>(() => {
    return {
      mode,
      viewMode,
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
    };
  }, [
    mode,
    viewMode,
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
  ]);

  return (
    <EditContext.Provider value={{ isEditing }}>
      <FormEditorContext.Provider value={controller}>
        <FieldFocusProvider>
          <Box flexDirection="column" width="100%">
            {children}
          </Box>
        </FieldFocusProvider>
      </FormEditorContext.Provider>
    </EditContext.Provider>
  );
};
