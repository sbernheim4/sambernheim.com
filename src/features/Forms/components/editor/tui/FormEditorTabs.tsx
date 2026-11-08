import { Box, Text, useInput } from "ink";
import type { FormEditorRegionProps } from "../formTypes";
import type { FormEditorTabProps } from "../FormEditorTab";
import type { FormEditorTabTriggerProps } from "../FormEditorTabTrigger";
import { useFormEditorContext } from "../../../hooks/useFormEditorContext";
import { useFieldFocus } from "../../fields/tui/FieldFocus";

export const FormEditorTabList = ({ children }: FormEditorRegionProps) => {
  return (
    <Box flexDirection="row" gap={2} marginBottom={1}>
      {children}
    </Box>
  );
};

export const FormEditorTabTrigger = ({ name, label, disabled }: FormEditorTabTriggerProps) => {
  const { activeTab, setActiveTab } = useFormEditorContext();
  const { focused } = useFieldFocus();
  useInput((_, key) => {
    if (focused && key.return && !disabled) {
      setActiveTab(name);
    }
  });
  return (
    <Text bold={activeTab === name} inverse={focused} dimColor={disabled}>
      {label}
    </Text>
  );
};

export const FormEditorTab = ({ name, label = name, children }: FormEditorTabProps) => {
  const { activeTab, viewMode } = useFormEditorContext();
  if (viewMode !== "page" && activeTab !== name) {
    return null;
  }
  return (
    <Box flexDirection="column" marginBottom={1}>
      {viewMode === "page" && <Text bold>{label}</Text>}
      {children}
    </Box>
  );
};
