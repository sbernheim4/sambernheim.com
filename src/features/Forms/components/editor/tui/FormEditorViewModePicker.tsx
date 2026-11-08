import { Box, Text, useInput } from "ink";
import { useFieldFocus } from "../../fields/tui/FieldFocus";
import type { ViewMode } from "../../../../Workspace/hooks/useViewModePreference";

export const FormEditorViewModePicker = ({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) => {
  const { focused } = useFieldFocus();
  const modes: ViewMode[] = ["tabs", "page"];
  useInput((input, key) => {
    if (!focused || (!key.leftArrow && !key.rightArrow && input !== "h" && input !== "l")) {
      return;
    }
    const offset = key.leftArrow || input === "h" ? -1 : 1;
    onChange(modes[(modes.indexOf(mode) + offset + modes.length) % modes.length]);
  });
  return (
    <Box gap={2}>
      <Text dimColor>View:</Text>
      {modes.map((item) => {
        return (
          <Text key={item} bold={mode === item} inverse={focused && mode === item}>
            {item === "page" ? "Full page" : item}
          </Text>
        );
      })}
    </Box>
  );
};
