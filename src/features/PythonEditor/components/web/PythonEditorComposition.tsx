import { Diagnostics } from "@features/CodeEditor";
import { usePythonEditorContext } from "./PythonEditorContext";
import { PythonEditorPane } from "./PythonEditorPane";
import { PythonEditorToolbar } from "./PythonEditorToolbar";

export const PythonEditorComposition = () => {
  const { diagnostics, revealDiagnostic, tyState } = usePythonEditorContext();

  return (
    <>
      <PythonEditorToolbar />
      <PythonEditorPane />
      <Diagnostics
        diagnostics={diagnostics}
        onSelect={revealDiagnostic}
        emptyMessage={tyState.status === "ready" ? "No issues reported." : tyState.message}
        error={tyState.status === "error"}
      />
    </>
  );
};
