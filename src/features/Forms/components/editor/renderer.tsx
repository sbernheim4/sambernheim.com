import { createContext, useContext, type ReactNode } from "react";
import { ViewModePicker } from "../../../Workspace/components/web/ViewModePreference/ViewModePreference";
import { FormEditorActions } from "./web/FormEditorActions";
import { FormEditorContent, FormEditorDraftBanner } from "./web/FormEditorContent";
import { FormEditorError } from "./web/FormEditorError";
import { FormEditorHeader } from "./web/FormEditorHeader";
import { FormEditorLayout } from "./web/FormEditorLayout";
import { FormEditorMain } from "./web/FormEditorMain";
import {
  FormEditorOrchestratorProgress,
  FormEditorOrchestratorStatus,
} from "./web/FormEditorOrchestratorProgress";
import { FormEditorProvider } from "./web/FormEditorProvider";
import { FormEditorTab } from "./web/FormEditorTab";
import { FormEditorTabList } from "./web/FormEditorTabList";
import { FormEditorTabTrigger } from "./web/FormEditorTabTrigger";
import { FormEditorTools } from "./web/FormEditorTools";
import { FormEditorUndo } from "./web/FormEditorUndo";

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
