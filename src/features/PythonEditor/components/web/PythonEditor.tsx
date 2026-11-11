import Editor from "@monaco-editor/react";
import { Diagnostics as EditorDiagnostics } from "@features/Editor/Diagnostics";
import { createContext, useContext, type ReactNode } from "react";
import { useTheme } from "../../../Theme/ThemeProvider";
import {
  buildEditableSource,
  useTyMonacoSession,
  type EditablePythonDefinition,
} from "../../hooks/useTyMonacoSession";
import "../../monaco";
import "./PythonEditor.css";

const HIDDEN_PYTHON_PRELUDE = `from dataclasses import dataclass\n\n@dataclass\nclass Car:\n    make: str\n    model: str\n`;
const EDITABLE_DEFINITIONS = [
  {
    signature: "def include_car(car: Car) -> bool:",
    initialBody: '    return car.make == "Toyota"',
  },
] as const;
type PythonEditorProps = {
  title?: string;
  description?: string;
  predefinedPython?: string;
  editableDefinitions?: readonly EditablePythonDefinition[];
  filePath?: string;
  children?: ReactNode;
};
type Diagnostic = ReturnType<typeof useTyMonacoSession>["diagnostics"][number];
const EditorContext = createContext<{
  filePath: string;
  initialSource: string;
  handleMount: ReturnType<typeof useTyMonacoSession>["handleMount"];
  diagnostics: Diagnostic[];
  revealDiagnostic: ReturnType<typeof useTyMonacoSession>["revealDiagnostic"];
  tyState: ReturnType<typeof useTyMonacoSession>["tyState"];
  resetSource: ReturnType<typeof useTyMonacoSession>["resetSource"];
} | null>(null);
const useEditorContext = () => {
  const value = useContext(EditorContext);
  if (!value) {
    throw new Error("PythonEditor parts must be used inside <PythonEditor>");
  }
  return value;
};

const EditorPane = () => {
  const { theme } = useTheme();
  const { filePath, initialSource, handleMount } = useEditorContext();
  return (
    <section className="workspace">
      <div className="editor-panel">
        <Editor
          height="100%"
          defaultLanguage="python"
          defaultPath={filePath}
          defaultValue={initialSource}
          theme={theme === "dark" ? "vs-dark" : "light"}
          onMount={handleMount}
          options={{
            automaticLayout: true,
            fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace',
            fontSize: 14,
            glyphMargin: true,
            lineNumbersMinChars: 3,
            minimap: { enabled: false },
            padding: { top: 12, bottom: 12 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            tabSize: 4,
            wordWrap: "on",
          }}
        />
      </div>
    </section>
  );
};
const Diagnostics = () => {
  const { diagnostics, revealDiagnostic, tyState } = useEditorContext();
  return (
    <EditorDiagnostics
      diagnostics={diagnostics}
      onSelect={revealDiagnostic}
      emptyMessage={tyState.status === "ready" ? "No issues reported." : tyState.message}
      error={tyState.status === "error"}
    />
  );
};
const Toolbar = () => {
  const { resetSource, tyState } = useEditorContext();
  return (
    <header className="topbar">
      <div>
        <h2>Python Editor</h2>
        <p>Monaco with ty WASM over a single in-memory Python file.</p>
      </div>
      <div className="topbar-actions">
        <button type="button" className="reset-button" onClick={resetSource}>
          Reset
        </button>
        <div className={`status-pill ${tyState.status}`} role="status" title={tyState.message}>
          <span>{tyState.status}</span>
          {tyState.version ? <strong>ty {tyState.version}</strong> : null}
        </div>
      </div>
    </header>
  );
};
const PythonEditorRoot = ({
  title = "Python Car Editor",
  description = "Monaco with ty WASM over a single in-memory Python file.",
  predefinedPython = HIDDEN_PYTHON_PRELUDE,
  editableDefinitions = EDITABLE_DEFINITIONS,
  filePath = "/main.py",
  children,
}: PythonEditorProps = {}) => {
  const initialSource = buildEditableSource(editableDefinitions);
  const session = useTyMonacoSession({ predefinedPython, editableDefinitions, filePath });
  const value = { ...session, initialSource, filePath };
  return (
    <EditorContext.Provider value={value}>
      <section className="editor-shell" aria-label={title}>
        <header className="topbar">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <div className="topbar-actions">
            <button type="button" className="reset-button" onClick={session.resetSource}>
              Reset
            </button>
            <div
              className={`status-pill ${session.tyState.status}`}
              role="status"
              title={session.tyState.message}
            >
              <span>{session.tyState.status}</span>
              {session.tyState.version ? <strong>ty {session.tyState.version}</strong> : null}
            </div>
          </div>
        </header>
        {children ?? (
          <>
            <EditorPane />
            <Diagnostics />
          </>
        )}
      </section>
    </EditorContext.Provider>
  );
};

export const PythonEditor = Object.assign(PythonEditorRoot, {
  Editor: EditorPane,
  Diagnostics,
  Toolbar,
});
