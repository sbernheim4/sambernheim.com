import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { Text } from "ink";
import type { ViewMode } from "../../../hooks/useViewModePreference";
export { useViewModePreference } from "../../../hooks/useViewModePreference";
export type { ViewMode } from "../../../hooks/useViewModePreference";
export const ViewModePicker = ({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) => {
  const visibleMode = mode === "page" ? "page" : "tabs";
  useTuiInput((input) => {
    if (input === "1") {
      onChange("tabs");
    } else if (input === "2") {
      onChange("page");
    }
  });
  return <Text dimColor>View: {visibleMode} · 1 tabs · 2 full page</Text>;
};
