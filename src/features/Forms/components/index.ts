import { createElement, type ComponentProps, type ComponentType } from "react";
import { useFormEditorRenderer, type FormEditorRenderer } from "./editor/renderer";

export { type FormEditorProviderProps, type FormEditorRegionProps } from "./editor/formTypes";
export { FormEditorRendererContext, webFormEditorRenderer } from "./editor/renderer";
export type { FormEditorRenderer } from "./editor/renderer";

const bind = <K extends keyof FormEditorRenderer>(key: K) => {
  return (props: ComponentProps<FormEditorRenderer[K]>) => {
    const Component = useFormEditorRenderer()[key] as ComponentType<object>;
    return createElement(Component, props as object);
  };
};

export const FormEditor = {
  Actions: bind("Actions"),
  Content: bind("Content"),
  DraftBanner: bind("DraftBanner"),
  Error: bind("Error"),
  Header: bind("Header"),
  Layout: bind("Layout"),
  Main: bind("Main"),
  OrchestratorProgress: bind("OrchestratorProgress"),
  OrchestratorStatus: bind("OrchestratorStatus"),
  Undo: bind("Undo"),
  Provider: bind("Provider"),
  Tab: bind("Tab"),
  TabList: bind("TabList"),
  TabTrigger: bind("TabTrigger"),
  Tools: bind("Tools"),
  Title: bind("Title"),
  ViewModePicker: bind("ViewModePicker"),
};
