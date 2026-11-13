import { type ReactNode } from "react";
import { Editor } from "@features/CodeEditor";
import {
  buildEditableSource,
  useTyMonacoSession,
  type EditablePythonDefinition,
} from "../../hooks/useTyMonacoSession";
import "../../monaco";
import "./PythonEditor.css";
import { PythonEditorProvider } from "./PythonEditorContext";
import { PythonEditorComposition } from "./PythonEditorComposition";

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
  const value = { ...session, initialSource, filePath, title, description };

  return (
    <PythonEditorProvider value={value}>
      <Editor title={title}>{children ?? <PythonEditorComposition />}</Editor>
    </PythonEditorProvider>
  );
};

export const PythonEditor = PythonEditorRoot;
