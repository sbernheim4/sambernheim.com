import { useEffect, useState, type ComponentType } from "react";
import type { ExampleProps } from "../useExampleState";

export const useTerminalExampleLoader = () => {
  const [Terminal, setTerminal] = useState<ComponentType<ExampleProps> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    const loadTerminalExample = async () => {
      try {
        await document.fonts.ready;
        const module = await import("../TerminalExample");
        if (active) {
          setTerminal(() => {
            return module.default;
          });
        }
      } catch {
        if (active) {
          setFailed(true);
        }
      }
    };

    void loadTerminalExample();
    return () => {
      active = false;
    };
  }, []);

  return { Terminal, failed };
};
