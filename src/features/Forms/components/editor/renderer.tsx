import { createContext, useContext, type ReactNode } from "react";
import { ViewModePicker } from "../../../Workspace/components/web/ViewModePreference/ViewModePreference";
import { FormEditorActions } from "./FormEditorActions";
import { FormEditorContent, FormEditorDraftBanner } from "./FormEditorContent";
import { FormEditorError } from "./FormEditorError";
import { FormEditorHeader } from "./FormEditorHeader";
import { FormEditorLayout } from "./FormEditorLayout";
import { FormEditorMain } from "./FormEditorMain";
import {
  FormEditorOrchestratorProgress,
  FormEditorOrchestratorStatus,
} from "./FormEditorOrchestratorProgress";
import { FormEditorProvider } from "./FormEditorProvider";
import { FormEditorTab } from "./FormEditorTab";
import { FormEditorTabList } from "./FormEditorTabList";
import { FormEditorTabTrigger } from "./FormEditorTabTrigger";
import { FormEditorTools } from "./FormEditorTools";
import { FormEditorUndo } from "./FormEditorUndo";

const Title = ({ children }: { children: ReactNode }) => {
  return (
    <div className="editor-heading">
      <h1>{children}</h1>
    </div>
  );
};
const FormEditorViewModePicker = (props: React.ComponentProps<typeof ViewModePicker>) => {
  return (
    <div className="form-editor-view-mode-toolbar">
      <ViewModePicker {...props} />
    </div>
  );
};
export const webFormEditorRenderer = {
  Actions: FormEditorActions,
  Content: FormEditorContent,
  DraftBanner: FormEditorDraftBanner,
  Error: FormEditorError,
  Header: FormEditorHeader,
  Layout: FormEditorLayout,
  Main: FormEditorMain,
  OrchestratorProgress: FormEditorOrchestratorProgress,
  OrchestratorStatus: FormEditorOrchestratorStatus,
  Undo: FormEditorUndo,
  Provider: FormEditorProvider,
  Tab: FormEditorTab,
  TabList: FormEditorTabList,
  TabTrigger: FormEditorTabTrigger,
  Tools: FormEditorTools,
  Title,
  ViewModePicker: FormEditorViewModePicker,
};
export type FormEditorRenderer = typeof webFormEditorRenderer;
export const FormEditorRendererContext = createContext<FormEditorRenderer>(webFormEditorRenderer);
export const useFormEditorRenderer = () => {
  return useContext(FormEditorRendererContext);
};
