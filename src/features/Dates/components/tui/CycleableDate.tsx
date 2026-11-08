import { format, formatDistanceToNow, isValid } from "date-fns";
import { Box, Text } from "ink";
import { useEffect } from "react";
import { useCycleableDateTimeMode } from "../../hooks/useCycleableDateTimeMode";
import { useFieldFocus } from "@features/Forms/components/fields/tui/FieldFocus";
import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";

export const TuiCycleableDate = ({
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
  const date = value instanceof Date ? value : new Date(value);
  const { mode, setMode } = useCycleableDateTimeMode();
  const { focused: fieldFocused, ref } = useFieldFocus(!managedFocus);
  const focused = controlledFocused ?? fieldFocused;
  useEffect(() => {
    onFocusChange?.(focused);
  }, [focused, onFocusChange]);
  useTuiInput((_, key) => {
    if (!managedFocus && focused && key.return) {
      setMode?.(mode === "relative" ? "utc" : "relative");
    }
  });
  const label = !isValid(date)
    ? "Invalid date"
    : mode === "relative"
      ? formatDistanceToNow(date, { addSuffix: true })
      : format(date, "PP");
  return (
    <Box ref={ref}>
      <Text inverse={focused || highlighted}>
        {label}
        {focused && showHint ? " · Enter to cycle" : ""}
      </Text>
    </Box>
  );
};

export const TuiCycleableDateTime = ({ value }: { value: Date }) => {
  const { mode, setMode } = useCycleableDateTimeMode();
  const { focused, ref } = useFieldFocus();
  useTuiInput((_, key) => {
    if (focused && key.return) {
      const modes = ["utc", "relative", "local"] as const;
      setMode?.(modes[(modes.indexOf(mode) + 1) % modes.length]);
    }
  });
  const label = !isValid(value)
    ? "Invalid date"
    : mode === "relative"
      ? formatDistanceToNow(value, { addSuffix: true })
      : mode === "local"
        ? format(value, "PPpp")
        : new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "medium",
            timeZone: "UTC",
          }).format(value);
  return (
    <Box ref={ref}>
      <Text inverse={focused}>
        {label}
        {focused ? " · Enter to cycle" : ""}
      </Text>
    </Box>
  );
};
