import { Box, Text } from "ink";
import { useCycleableDateModel } from "../../hooks/useCycleableDateModel";
import { useFieldFocus } from "@features/Forms/components/fields/tui/FieldFocus";
import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { useCycleableDateFocusChange } from "../../hooks/tui/useCycleableDateFocusChange";

export const CycleableDate = ({
  value,
  onFocusChange,
  showHint = true,
  managedFocus = false,
  focused: controlledFocused,
  highlighted = false,
}: {
  value: Date | string | number;
  onFocusChange?: (focused: boolean) => void;
  showHint?: boolean;
  managedFocus?: boolean;
  focused?: boolean;
  highlighted?: boolean;
}) => {
  const { text, cycleMode } = useCycleableDateModel(value);
  const { focused: fieldFocused, ref } = useFieldFocus(!managedFocus);
  const focused = controlledFocused ?? fieldFocused;
  useCycleableDateFocusChange(focused, onFocusChange);
  useTuiInput((_, key) => {
    if (!managedFocus && focused && key.return) {
      cycleMode();
    }
  });
  return (
    <Box ref={ref}>
      <Text inverse={focused || highlighted}>
        {text}
        {focused && showHint ? " · Enter to cycle" : ""}
      </Text>
    </Box>
  );
};
