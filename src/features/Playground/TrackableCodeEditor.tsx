import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTheme } from "@features/Theme/ThemeProvider";
import "./trackableMonaco";

type TrackableCodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onDiagnostics?: (markers: editor.IMarker[]) => void;
  onMount?: (editor: editor.IStandaloneCodeEditor) => void;
};

export const TrackableCodeEditor = ({
  value,
  onChange,
  onDiagnostics,
  onMount,
}: TrackableCodeEditorProps) => {
  const { theme } = useTheme();
  return (
    <Editor
      height="680px"
      path="/trackable-example.ts"
      language="typescript"
      value={value}
      theme={theme === "dark" ? "vs-dark" : "light"}
      onChange={(nextValue) => {
        onChange(nextValue ?? "");
      }}
      onValidate={onDiagnostics}
      onMount={(instance) => {
        const chain = instance
          .getModel()
          ?.findMatches("function createChain", false, false, false, null, true)[0];
        if (chain) {
          instance.revealLineNearTop(chain.range.startLineNumber);
        }
        onMount?.(instance);
      }}
      options={{
        automaticLayout: true,
        fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        fontSize: 13,
        glyphMargin: true,
        lineNumbersMinChars: 3,
        minimap: { enabled: false },
        padding: { top: 12, bottom: 12 },
        scrollBeyondLastLine: false,
        tabSize: 2,
      }}
    />
  );
};
