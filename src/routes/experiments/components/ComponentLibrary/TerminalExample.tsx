import { useRef, useState, type ReactNode, type RefObject } from "react";
import { Box } from "ink";
import type { Terminal } from "@xterm/xterm";
import { FieldPrimitivesContext } from "@/features/Forms/components/fields";
import { tuiFieldPrimitives } from "@/features/Forms/components/fields/tui";
import { FieldFocusProvider } from "@/features/Forms/components/fields/tui/FieldFocus";
import { TuiInputModeProvider } from "@/features/Workspace/components/tui/Primitives/InputMode";
import { CycleableDateTimeProvider } from "@/features/Dates";
import type { ExampleProps } from "./useExampleState";
import { ComponentRendererProvider } from "./renderer";
import { tuiComponentRenderer } from "./tuiRenderer";
import { SharedExample } from "./SharedExample";
import { useInkTerminalMount } from "./hooks/tui/useInkTerminalMount";
import { useInkTerminalViewport } from "./hooks/tui/useInkTerminalViewport";
import "ink-web/css";
import "@xterm/xterm/css/xterm.css";

export const TerminalComponentExample = (props: ExampleProps) => {
  const [mode, setMode] = useState<"normal" | "insert">("normal");
  return (
    <TuiInputModeProvider mode={mode} setMode={setMode} paletteOpen={false}>
      <FieldFocusProvider>
        <FieldPrimitivesContext.Provider value={tuiFieldPrimitives}>
          <CycleableDateTimeProvider mode={props.dateMode} onModeChange={props.onDateModeChange}>
            <ComponentRendererProvider renderer={tuiComponentRenderer}>
              <Box flexDirection="column" width="100%" padding={1}>
                <SharedExample {...props} />
              </Box>
            </ComponentRendererProvider>
          </CycleableDateTimeProvider>
        </FieldPrimitivesContext.Provider>
      </FieldFocusProvider>
    </TuiInputModeProvider>
  );
};

// xterm's fitted size must also reach Ink's layout engine. ink-web currently
// gates its own fit/stream update behind a private renderer check that can fail
// with xterm 6, so subscribe to the terminal's public resize event instead.
const TerminalViewport = ({
  terminalRef,
  children,
}: {
  terminalRef: RefObject<Terminal | null>;
  children: ReactNode;
}) => {
  useInkTerminalViewport(terminalRef);
  return children;
};

const TerminalExample = (props: ExampleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const renderExample = () => {
    return (
      <TerminalViewport terminalRef={terminalRef}>
        <TerminalComponentExample key={props.id} {...props} />
      </TerminalViewport>
    );
  };
  useInkTerminalMount(containerRef, terminalRef, renderExample, props);

  return (
    <div className="ink-terminal-box" style={{ height: "100%", background: "#151a20" }}>
      <div ref={containerRef} className="ink-terminal-reset" style={{ inset: 0 }} />
    </div>
  );
};

export default TerminalExample;
