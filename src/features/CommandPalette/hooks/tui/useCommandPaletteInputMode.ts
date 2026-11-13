import { useEffect } from "react";
import { type CommandPaletteMode, shouldRenderCommandPalette } from "../../model";
import { useTuiInputMode } from "@features/Workspace/components/tui/Primitives/InputMode";

export const useCommandPaletteInputMode = (mode: CommandPaletteMode, open: boolean) => {
  const inputMode = useTuiInputMode();
  const visible = shouldRenderCommandPalette(mode, open);

  useEffect(() => {
    if (!visible) {
      inputMode.setMode("normal");
    }
  }, [inputMode.setMode, visible]);

  return inputMode;
};
