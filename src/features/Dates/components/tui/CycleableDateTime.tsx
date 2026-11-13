import { Box, Text } from "ink";
import { formatCycleableDateTime } from "../../format";
import {
  cycleableDateTimeModes,
  getNextCycleableDateTimeMode,
  useCycleableDateTimeMode,
} from "../../hooks/useCycleableDateTimeMode";
import { useFieldFocus } from "@features/Forms/components/fields/tui/FieldFocus";
import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { useRelativeDateRefresh } from "../../hooks/useRelativeDateRefresh";

export const CycleableDateTime = ({ value }: { value: Date }) => {
  const { mode, setMode } = useCycleableDateTimeMode();
  const { focused, ref } = useFieldFocus();
  useRelativeDateRefresh(mode === "relative", 30_000);
  useTuiInput((_, key) => {
    if (focused && key.return) {
      setMode?.(getNextCycleableDateTimeMode(mode, cycleableDateTimeModes));
    }
  });
  const label = formatCycleableDateTime(value, mode);
  return (
    <Box ref={ref}>
      <Text inverse={focused}>
        {label}
        {focused ? " · Enter to cycle" : ""}
      </Text>
    </Box>
  );
};
