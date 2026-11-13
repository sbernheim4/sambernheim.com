import { Component, useRef, useState, type ReactNode } from "react";
import { CycleableDateTimeProvider } from "@/features/Dates";
import { FieldPrimitivesContext } from "@/features/Forms/components/fields";
import { webFieldPrimitives } from "@/features/Forms/components/fields/web";
import { catalog, type ComponentId } from "./catalog";
import { ComponentRendererProvider } from "./renderer";
import { webComponentRenderer } from "./webRenderer";
import { SharedExample } from "./SharedExample";
import type { ExampleProps } from "./useExampleState";
import { useExampleState } from "./useExampleState";
import { useTerminalExampleLoader } from "./hooks/useTerminalExampleLoader";

class PreviewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="alert">The terminal could not start. Reload the page to retry.</p>
    ) : (
      this.props.children
    );
  }
}

const WebExample = (props: ExampleProps) => {
  return (
    <CycleableDateTimeProvider mode={props.dateMode} onModeChange={props.onDateModeChange}>
      <FieldPrimitivesContext.Provider value={webFieldPrimitives}>
        <ComponentRendererProvider renderer={webComponentRenderer}>
          <SharedExample {...props} />
        </ComponentRendererProvider>
      </FieldPrimitivesContext.Provider>
    </CycleableDateTimeProvider>
  );
};

export const ComponentExample = ({ selected }: { selected: ComponentId }) => {
  const model = useExampleState();
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const [revision, setRevision] = useState(0);
  const { Terminal, failed } = useTerminalExampleLoader();
  const entry = catalog.find((item) => {
    return item.id === selected;
  })!;
  const { reset, ...exampleState } = model;
  const example: ExampleProps = { ...exampleState, id: selected };

  return (
    <article className="component-library-content" aria-labelledby="component-title">
      <div className="component-library-title">
        <div>
          <span className="playground-eyebrow">{entry.group}</span>
          <h2 id="component-title">{entry.name}</h2>
        </div>
        <button
          ref={resetButtonRef}
          type="button"
          onClick={() => {
            reset();
            setRevision((value) => {
              return value + 1;
            });
          }}
        >
          Reset examples
        </button>
      </div>
      <p className="component-library-description">{entry.description}</p>
      <div
        className={`component-library-previews${selected === "commands" || selected === "table" ? " component-library-previews--large" : ""}${selected === "commands" ? " component-library-previews--commands" : ""}`}
        key={`${selected}-${revision}`}
      >
        <section className="component-library-preview">
          <header>
            <h3>Web</h3>
            <span>React DOM</span>
          </header>
          <div className="component-library-web">
            <WebExample {...example} />
          </div>
          <p>{entry.web}</p>
        </section>
        <section className="component-library-preview">
          <header>
            <h3>Terminal</h3>
            <span>Ink + xterm.js</span>
          </header>
          <div
            className="component-library-terminal"
            aria-label={`${entry.name} interactive terminal`}
            onKeyDownCapture={(event) => {
              if (event.key === "Tab") {
                event.preventDefault();
                event.stopPropagation();
                resetButtonRef.current?.focus();
              }
            }}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.stopPropagation();
              }
            }}
          >
            <PreviewBoundary>
              {Terminal ? (
                <Terminal {...example} />
              ) : (
                <p role={failed ? "alert" : "status"}>
                  {failed ? "Unable to load the terminal. Reload to retry." : "Loading terminal…"}
                </p>
              )}
            </PreviewBoundary>
          </div>
          <p>{entry.terminal} Use Tab to leave the terminal.</p>
        </section>
      </div>
      <p className="component-library-note">{entry.note}</p>
    </article>
  );
};
