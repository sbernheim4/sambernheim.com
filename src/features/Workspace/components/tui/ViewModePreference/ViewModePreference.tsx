import { Text, useInput } from "ink";
import { useState } from "react";
export type ViewMode = "tabs" | "page" | "sidebar";
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
  useInput((input) => {
    if (input === "1") {
      onChange("sidebar");
    } else if (input === "2") {
      onChange("tabs");
    } else if (input === "3") {
      onChange("page");
    }
  });
  return <Text dimColor>View: {mode} · 1 sidebar · 2 tabs · 3 full page</Text>;
};
