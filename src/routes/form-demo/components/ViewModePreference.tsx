import { useEffect, useState } from "react";
import "./ViewModePreference.css";

export type ViewMode = "tabs" | "page";

const viewModePreferenceKey = "form-demo:view-mode";

const readViewMode = (): ViewMode => {
  if (typeof window === "undefined") {
    return "tabs";
  }

  if (window.localStorage.getItem(viewModePreferenceKey) === "page") {
    return "page";
  }

  return "tabs";
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
      <button
        className="view-mode-option"
        type="button"
        aria-pressed={mode === "tabs"}
        data-selected={mode === "tabs"}
        onClick={() => {
          onChange("tabs");
        }}
      >
        Tabs
      </button>
      <button
        className="view-mode-option"
        type="button"
        aria-pressed={mode === "page"}
        data-selected={mode === "page"}
        onClick={() => {
          onChange("page");
        }}
      >
        Full page
      </button>
    </div>
  );
};
