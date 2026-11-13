import { createFileRoute } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type ComponentType } from "react";
import type { editor } from "monaco-editor";
import { CommandButton, CommandLink } from "@/features";
import { buildTrackableSource, trackableExamples } from "@features/Playground/trackableExamples";
import { Diagnostics } from "@features/CodeEditor";
import "./trackable.css";

// Start removes these function bodies and their imports from the server build.
const loadCodeEditor = createClientOnlyFn(() => {
  return import("@features/Playground/TrackableCodeEditor");
});
const compileSource = createClientOnlyFn(async (model: editor.ITextModel) => {
  const { compileTrackableSource } = await import("@features/Playground/trackableMonaco");
  return compileTrackableSource(model);
});

type RunnerResponse =
  | { type: "ready"; value: unknown; queued: readonly unknown[] }
  | { type: "executed"; value: unknown; queued: readonly unknown[]; emitted: readonly unknown[] }
  | { type: "error"; message: string };

type RunState = {
  phase: "idle" | "compiling" | "running" | "executing" | "executed" | "error";
  value: unknown;
  queued: readonly unknown[];
  emitted: readonly unknown[];
  message: string;
};

const initialState: RunState = {
  phase: "idle",
  value: null,
  queued: [],
  emitted: [],
  message: "Run the code to inspect its value and events.",
};

const formatOutput = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
};

const TrackableExperiment = () => {
  const [CodeEditor, setCodeEditor] = useState<ComponentType<{
    value: string;
    onChange: (value: string) => void;
    onDiagnostics: (markers: editor.IMarker[]) => void;
    onMount: (instance: editor.IStandaloneCodeEditor) => void;
  }> | null>(null);
  const [selectedId, setSelectedId] = useState(trackableExamples[0].id);
  const [source, setSource] = useState(() => {
    return buildTrackableSource(trackableExamples[0]);
  });
  const [state, setState] = useState<RunState>(initialState);
  const [diagnostics, setDiagnostics] = useState<editor.IMarker[]>([]);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);

  const clearTimeoutRef = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  const stopWorker = () => {
    runIdRef.current += 1;
    workerRef.current?.terminate();
    workerRef.current = null;
    clearTimeoutRef();
  };
  useEffect(() => {
    let active = true;
    if (!import.meta.env.SSR) {
      void loadCodeEditor().then((module) => {
        if (active) {
          setCodeEditor(() => {
            return module.TrackableCodeEditor;
          });
        }
      });
    }
    return () => {
      active = false;
      stopWorker();
    };
  }, []);

  const changeSource = (nextSource: string) => {
    stopWorker();
    setSource(nextSource);
    setState(initialState);
    setDiagnostics([]);
  };
  const changeExample = (id: string) => {
    const example = trackableExamples.find((item) => {
      return item.id === id;
    });
    if (!example) {
      return;
    }
    setSelectedId(id);
    changeSource(buildTrackableSource(example));
    requestAnimationFrame(() => {
      const instance = editorRef.current;
      const model = instance?.getModel();
      const match = model?.findMatches("function createChain", false, false, false, null, true)[0];
      if (match) {
        instance?.revealLineNearTop(match.range.startLineNumber);
      }
    });
  };
  const armTimeout = (worker: Worker, runId: number) => {
    clearTimeoutRef();
    timeoutRef.current = setTimeout(() => {
      if (runIdRef.current !== runId) {
        return;
      }
      worker.terminate();
      workerRef.current = null;
      setState((previous) => {
        return {
          ...previous,
          phase: "error",
          message: "The code took too long to run. Check for an infinite loop and try again.",
        };
      });
    }, 3000);
  };
  const runCode = async () => {
    if (import.meta.env.SSR) {
      return;
    }
    const model = editorRef.current?.getModel();
    if (!model) {
      setState({ ...initialState, phase: "error", message: "The editor is still loading." });
      return;
    }
    stopWorker();
    const runId = runIdRef.current;
    setState({ ...initialState, phase: "compiling", message: "Checking TypeScript…" });
    try {
      const { code, diagnostics } = await compileSource(model);
      if (runIdRef.current !== runId) {
        return;
      }
      if (diagnostics.length) {
        setState({ ...initialState, phase: "error", message: diagnostics.join("\n") });
        return;
      }
      const worker = new Worker(
        new URL("../../features/Playground/trackableRunner.worker.ts", import.meta.url),
        { type: "module" },
      );
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<RunnerResponse>) => {
        if (runIdRef.current !== runId) {
          return;
        }
        clearTimeoutRef();
        const response = event.data;
        if (response.type === "error") {
          stopWorker();
          setState({ ...initialState, phase: "error", message: response.message });
        } else if (response.type === "ready") {
          setState({
            phase: "executing",
            value: response.value,
            queued: response.queued,
            emitted: [],
            message: "Executing the chain and emitting its events…",
          });
          armTimeout(worker, runId);
          worker.postMessage({ type: "execute" });
        } else {
          setState({
            phase: "executed",
            value: response.value,
            queued: response.queued,
            emitted: response.emitted,
            message: "Run complete.",
          });
        }
      };
      worker.onerror = () => {
        if (runIdRef.current !== runId) {
          return;
        }
        stopWorker();
        setState({
          ...initialState,
          phase: "error",
          message: "The code could not run in the browser worker.",
        });
      };
      setState({ ...initialState, phase: "running", message: "Running code…" });
      armTimeout(worker, runId);
      worker.postMessage({ type: "prepare", code });
    } catch (error) {
      if (runIdRef.current !== runId) {
        return;
      }
      setState({
        ...initialState,
        phase: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };
  const selectedExample = trackableExamples.find((item) => {
    return item.id === selectedId;
  });
  const hasResult = state.phase === "executing" || state.phase === "executed";
  return (
    <section className="playground-page trackable-experiment">
      <header className="playground-heading">
        <h1>Using the Trackable Monad</h1>
        <p>
          This is the <code>Trackable</code> class from my{" "}
          <CommandLink to="/blog/$slug" params={{ slug: "building-a-monad" }}>
            article on building a monad
          </CommandLink>
          . Use <code>map</code> to change its value while keeping queued analytics events. Use{" "}
          <code>flatMap</code> when the next function returns another Trackable. Pick an example,
          edit the TypeScript, then run it to see the value and events.
        </p>
      </header>
      <div className="trackable-grid">
        <section
          className="trackable-panel trackable-code-panel"
          aria-labelledby="trackable-code-heading"
        >
          <h2 id="trackable-code-heading">Build a chain</h2>
          <div className="trackable-example-picker">
            <label htmlFor="trackable-example">Example</label>
            <select
              id="trackable-example"
              value={selectedId}
              onChange={(event) => {
                return changeExample(event.target.value);
              }}
            >
              {trackableExamples.map((example) => {
                return (
                  <option key={example.id} value={example.id}>
                    {example.label}
                  </option>
                );
              })}
            </select>
          </div>
          <p className="trackable-example-description">{selectedExample?.description}</p>
          <p className="trackable-editor-hint">
            Hover over a method to inspect its types. Edit the chain, helpers, or event data, then
            run the code.
          </p>
          <div className="trackable-editor">
            {CodeEditor ? (
              <CodeEditor
                value={source}
                onChange={changeSource}
                onDiagnostics={setDiagnostics}
                onMount={(instance) => {
                  editorRef.current = instance;
                }}
              />
            ) : (
              <p className="trackable-editor-loading" role="status">
                Loading TypeScript editor…
              </p>
            )}
          </div>
          <Diagnostics
            diagnostics={diagnostics.map((marker) => {
              return {
                marker,
                code: typeof marker.code === "object" ? marker.code.value : marker.code,
                severity:
                  marker.severity === 8
                    ? ("error" as const)
                    : marker.severity === 4
                      ? ("warning" as const)
                      : ("info" as const),
                startLineNumber: marker.startLineNumber,
                startColumn: marker.startColumn,
                message: marker.message,
              };
            })}
            onSelect={({ marker }) => {
              editorRef.current?.revealLineInCenter(marker.startLineNumber);
              editorRef.current?.setPosition({
                lineNumber: marker.startLineNumber,
                column: marker.startColumn,
              });
              editorRef.current?.focus();
            }}
          />
          <div className="trackable-actions trackable-run-actions">
            <CommandButton
              type="button"
              className="trackable-primary-action"
              command={{ group: "Trackable demo" }}
              disabled={
                !CodeEditor ||
                state.phase === "compiling" ||
                state.phase === "running" ||
                state.phase === "executing"
              }
              onClick={() => {
                return void runCode();
              }}
            >
              Run code
            </CommandButton>
          </div>
        </section>
        <section
          className="trackable-panel trackable-results-panel"
          aria-labelledby="trackable-value-heading"
        >
          <h2 id="trackable-value-heading">Trackable state</h2>
          {state.phase !== "executed" && (
            <p
              className={`trackable-status${state.phase === "error" ? " trackable-status-error" : ""}`}
              role="status"
            >
              {state.message}
            </p>
          )}
          {hasResult && (
            <>
              <div className="trackable-value" aria-live="polite">
                <span>Returned value</span>
                {typeof state.value === "object" && state.value !== null ? (
                  <details className="trackable-object-value">
                    <summary>View object</summary>
                    <pre>{formatOutput(state.value)}</pre>
                  </details>
                ) : (
                  <strong>{formatOutput(state.value)}</strong>
                )}
              </div>
              <h3>Emitted events ({state.emitted.length})</h3>
              {state.emitted.length ? (
                <ol className="trackable-event-list" aria-live="polite">
                  {state.emitted.map((event, index) => {
                    return (
                      <li key={index}>
                        <details>
                          <summary>
                            <span className="trackable-event-index">{index + 1}</span>
                            <span>
                              {typeof event === "object" &&
                              event !== null &&
                              "functionName" in event &&
                              typeof event.functionName === "string"
                                ? event.functionName
                                : "Event " + (index + 1)}
                            </span>
                            <small>View JSON</small>
                          </summary>
                          <pre>{formatOutput(event)}</pre>
                        </details>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p>
                  {state.phase === "executing" ? "Emitting events…" : "No events in this chain."}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </section>
  );
};

export const Route = createFileRoute("/experiments/trackable")({
  head: () => {
    return { meta: [{ title: "Trackable experiment — Samuel Bernheim" }] };
  },
  component: TrackableExperiment,
});
