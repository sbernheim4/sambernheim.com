import { useEffect, useState } from "react";
import { CommandButton } from "../../../shared/components/CommandButton";
import "./ViewModePreference.css";

export type ViewMode = "tabs" | "page" | "sidebar";

const viewModePreferenceKey = "form-demo:view-mode";

const readViewMode = (): ViewMode => {
  if (typeof window === "undefined") {
    return "tabs";
  }

  const storedMode = window.localStorage.getItem(viewModePreferenceKey);
  return storedMode === "page" || storedMode === "sidebar" ? storedMode : "tabs";
};

export const useViewModePreference = () => {
  const [mode, setMode] = useState<ViewMode>("tabs");

  useEffect(() => {
    setMode(readViewMode());
  }, []);

  const updateMode = (nextMode: ViewMode) => {
    setMode(nextMode);
    window.localStorage.setItem(viewModePreferenceKey, nextMode);
  };

  return { mode, updateMode };
};

export const ViewModePicker = ({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) => {
  return (
    <div className="view-mode-picker" role="group" aria-label="View preference">
      <CommandButton
        className="view-mode-option"
        type="button"
        aria-pressed={mode === "tabs"}
        data-selected={mode === "tabs"}
        onClick={() => {
          onChange("tabs");
        }}
      >
        Tabs
      </CommandButton>
      <CommandButton
        className="view-mode-option"
        type="button"
        aria-pressed={mode === "page"}
        data-selected={mode === "page"}
        onClick={() => {
          onChange("page");
        }}
      >
        Full page
      </CommandButton>
      <CommandButton
        className="view-mode-option"
        type="button"
        aria-pressed={mode === "sidebar"}
        data-selected={mode === "sidebar"}
        onClick={() => {
          onChange("sidebar");
        }}
      >
        Sidebar
      </CommandButton>
    </div>
  );
};
