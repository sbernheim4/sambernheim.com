import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { useTyMonacoSession } from "../../hooks/useTyMonacoSession";

type EditorSession = ReturnType<typeof useTyMonacoSession>;

export type PythonEditorContextValue = Pick<
  EditorSession,
  "handleMount" | "diagnostics" | "revealDiagnostic" | "tyState" | "resetSource"
> & {
  title: string;
  description: string;
  filePath: string;
  initialSource: string;
};

const PythonEditorContext = createContext<PythonEditorContextValue | null>(null);

export const PythonEditorProvider = ({
  value,
  children,
}: {
  value: PythonEditorContextValue;
  children: ReactNode;
}) => {
  return <PythonEditorContext.Provider value={value}>{children}</PythonEditorContext.Provider>;
};

export const usePythonEditorContext = () => {
  const value = useContext(PythonEditorContext);
  if (!value) {
    throw new Error("PythonEditor parts must be used inside <PythonEditor>");
  }
  return value;
};
