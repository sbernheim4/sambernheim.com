import Editor from "@monaco-editor/react";
import { useTheme } from "@features/Theme/ThemeProvider";
import { usePythonEditorContext } from "./PythonEditorContext";

export const PythonEditorPane = () => {
  const { theme } = useTheme();
  const { filePath, initialSource, handleMount } = usePythonEditorContext();

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
