import { createContext, useContext, type ReactNode } from "react";

import { FormEditor, type FormEditorProviderProps } from "../components";

const MISSING_EDITOR_CONTEXT = Symbol("missing-editor-context");

export type EntityLoadState =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready" };

export type EditorRegistration = {
  form: unknown;
  loadState?: EntityLoadState;
};

export type EditorRegistry = Record<string, EditorRegistration>;
export type EditorName<TRegistry extends EditorRegistry> = Extract<keyof TRegistry, string>;

export type TypedEntityEditorProps<TRegistry extends EditorRegistry> = Omit<
  FormEditorProviderProps,
  "children"
> & {
  children: ReactNode;
  editors: Partial<TRegistry>;
};

export const createEntityEditorContext = <TRegistry extends EditorRegistry>() => {
  const EditorContext = createContext<Partial<TRegistry> | typeof MISSING_EDITOR_CONTEXT>(
    MISSING_EDITOR_CONTEXT,
  );

  const useEditor = <TName extends EditorName<TRegistry>>(name: TName): TRegistry[TName] => {
    const editors = useContext(EditorContext);
    if (editors === MISSING_EDITOR_CONTEXT) {
      throw new Error("Editor components must be rendered inside an entity editor root.");
    }
    const editor = editors[name];
    if (!editor) {
      throw new Error(`Editor "${name}" is not registered.`);
    }
    return editor as TRegistry[TName];
  };

  const EntityEditor = ({ editors, children, ...props }: TypedEntityEditorProps<TRegistry>) => (
    <EditorContext.Provider value={editors}>
      <FormEditor.Provider {...props}>{children}</FormEditor.Provider>
    </EditorContext.Provider>
  );

  return {
    EntityEditor,
    useEditor,
    useEditorForm: <TName extends EditorName<TRegistry>>(name: TName) => useEditor(name).form,
    useEditorLoadState: <TName extends EditorName<TRegistry>>(name: TName) =>
      useEditor(name).loadState,
  };
};
