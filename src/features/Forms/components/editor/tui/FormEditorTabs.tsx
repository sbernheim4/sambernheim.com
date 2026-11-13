import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { Box, Text } from "ink";
import type { FormEditorRegionProps } from "../formTypes";
import type { FormEditorTabProps, FormEditorTabTriggerProps } from "../formTypes";
import { useFormEditorContext } from "../../../hooks/useFormEditorContext";
import { useFieldFocus } from "../../fields/tui/FieldFocus";

export const FormEditorTabList = ({ children }: FormEditorRegionProps) => {
  const { viewMode } = useFormEditorContext();
  if (viewMode === "page") {
    return <></>;
  }
  return (
    <Box flexDirection="row" gap={2} marginBottom={1}>
      {children}
    </Box>
  );
};

export const FormEditorTabTrigger = ({ name, label, disabled }: FormEditorTabTriggerProps) => {
  const { activeTab, setActiveTab } = useFormEditorContext();
  const { focused, ref } = useFieldFocus();
  useTuiInput((_, key) => {
    if (focused && key.return && !disabled) {
      setActiveTab(name);
    }
  });
  return (
    <Box ref={ref}>
      <Text color="yellow" bold={activeTab === name} inverse={focused} dimColor={disabled}>
        {activeTab === name ? `[ ${label} ]` : label}
      </Text>
    </Box>
  );
};

export const FormEditorTab = ({ name, label = name, children }: FormEditorTabProps) => {
  const { activeTab, viewMode } = useFormEditorContext();
  if (viewMode !== "page" && activeTab !== name) {
    return null;
  }
  return (
    <Box flexDirection="column" marginBottom={1}>
      {viewMode === "page" && (
        <Text bold color="yellow">
          {label}
        </Text>
      )}
      {children}
    </Box>
  );
};
