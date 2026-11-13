import { useEffect, useRef, type ReactElement, type RefObject } from "react";
import { mountInkInXterm } from "ink-web";
import { FitAddon } from "@xterm/addon-fit";
import type { ITerminalOptions, Terminal } from "@xterm/xterm";

const terminalOptions: ITerminalOptions = {
  fontSize: 13,
  lineHeight: 1.3,
  macOptionIsMeta: true,
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  screenReaderMode: true,
  minimumContrastRatio: 4.5,
  theme: {
    background: "#151a20",
    foreground: "#e6e8eb",
    cyan: "#8fc7ed",
    yellow: "#e4c27d",
    green: "#a7e0c6",
    black: "#151a20",
    white: "#e6e8eb",
  },
};

type MountedInkTerminal = ReturnType<typeof mountInkInXterm>;

export const useInkTerminalMount = (
  containerRef: RefObject<HTMLDivElement | null>,
  terminalRef: RefObject<Terminal | null>,
  renderExample: () => ReactElement,
  renderKey: unknown,
) => {
  const mountedRef = useRef<MountedInkTerminal | null>(null);
  const renderExampleRef = useRef(renderExample);
  renderExampleRef.current = renderExample;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let active = true;
    const mounted = mountInkInXterm(renderExampleRef.current(), {
      container,
      focus: false,
      termOptions: terminalOptions,
    });
    mountedRef.current = mounted;
    terminalRef.current = mounted.term;

    const fitAddon = new FitAddon();
    mounted.term.loadAddon(fitAddon);
    const fit = () => {
      if (active && container.clientWidth > 0 && container.clientHeight > 0) {
        fitAddon.fit();
      }
    };
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    fit();
    const frame = requestAnimationFrame(fit);
    void document.fonts.ready.then(fit);

    return () => {
      active = false;
      observer.disconnect();
      cancelAnimationFrame(frame);
      mountedRef.current = null;
      terminalRef.current = null;
      void mounted.unmount();
    };
  }, [containerRef, terminalRef]);

  useEffect(() => {
    mountedRef.current?.rerender(renderExampleRef.current());
  }, [renderKey]);
};
