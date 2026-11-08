import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { Box, Text } from "ink";
import { useFieldFocus } from "../../fields/tui/FieldFocus";
import type { ViewMode } from "../../../../Workspace/hooks/useViewModePreference";

const ViewModeOption = ({
  mode,
  selected,
  onChange,
}: {
  mode: ViewMode;
  selected: boolean;
  onChange: (mode: ViewMode) => void;
}) => {
  const { focused, ref } = useFieldFocus();
  useTuiInput((_, key) => {
    if (focused && key.return) {
      onChange(mode);
    }
  });
  return (
    <Box ref={ref}>
      <Text bold={selected} inverse={focused} color={selected ? "cyan" : undefined}>
        {mode === "page" ? "Full page" : "Tabs"}
      </Text>
    </Box>
  );
};

export const FormEditorViewModePicker = ({
  mode: selectedMode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) => {
  const modes: ViewMode[] = ["tabs", "page"];
  return (
    <Box gap={2}>
      <Text dimColor>View:</Text>
      {modes.map((mode) => {
        return (
          <ViewModeOption
            key={mode}
            mode={mode}
            selected={selectedMode === mode}
            onChange={onChange}
          />
        );
      })}
    </Box>
  );
};
