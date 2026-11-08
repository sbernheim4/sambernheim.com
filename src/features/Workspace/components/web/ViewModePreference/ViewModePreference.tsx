import { CommandButton } from "@/features";
import type { ViewMode } from "../../../hooks/useViewModePreference";
export { useViewModePreference } from "../../../hooks/useViewModePreference";
import "./ViewModePreference.css";

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
        aria-pressed={mode === "sidebar"}
        data-selected={mode === "sidebar"}
        onClick={() => {
          onChange("sidebar");
        }}
      >
        Sidebar
      </CommandButton>
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
    </div>
  );
};
