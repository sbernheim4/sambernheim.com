import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { Text } from "ink";
import { useState } from "react";
export type ViewMode = "tabs" | "page";
export const useViewModePreference = () => {
  const [mode, updateMode] = useState<ViewMode>("page");
  return { mode, updateMode };
};
export const ViewModePicker = ({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) => {
  useTuiInput((input) => {
    if (input === "1") {
      onChange("tabs");
    } else if (input === "2") {
      onChange("page");
    }
  });
  return <Text dimColor>View: {mode} · 1 tabs · 2 full page</Text>;
};
