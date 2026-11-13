import { useEffect, type RefObject } from "react";
import { useStdout } from "ink";
import type { Terminal } from "@xterm/xterm";

export const useInkTerminalViewport = (terminalRef: RefObject<Terminal | null>) => {
  const { stdout } = useStdout();

  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal) {
      return;
    }

    const syncViewport = () => {
      if (stdout.columns === terminal.cols && stdout.rows === terminal.rows) {
        return;
      }
      stdout.columns = terminal.cols;
      stdout.rows = terminal.rows;
      stdout.emit("resize");
    };

    const subscription = terminal.onResize(syncViewport);
    syncViewport();
    return () => {
      subscription.dispose();
    };
  }, [stdout, terminalRef]);
};
