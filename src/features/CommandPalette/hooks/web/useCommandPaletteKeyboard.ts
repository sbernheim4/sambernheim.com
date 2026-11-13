import { useEffect } from "react";
import type { CommandPaletteMode } from "../../model";

export const useCommandPaletteKeyboard = (
  mode: CommandPaletteMode,
  toggle: () => void,
  close: () => void,
) => {
  useEffect(() => {
    if (mode === "inline") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, mode, toggle]);
};
