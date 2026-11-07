import { FormEditorActions } from "./editor/FormEditorActions";
import { FormEditorContent, FormEditorDraftBanner } from "./editor/FormEditorContent";
import { FormEditorError } from "./editor/FormEditorError";
import { FormEditorHeader } from "./editor/FormEditorHeader";
import { FormEditorLayout } from "./editor/FormEditorLayout";
import { FormEditorMain } from "./editor/FormEditorMain";
import {
  FormEditorOrchestratorProgress,
  FormEditorOrchestratorStatus,
} from "./editor/FormEditorOrchestratorProgress";
import { FormEditorUndo } from "./editor/FormEditorUndo";
import { FormEditorProvider } from "./editor/FormEditorProvider";
import { FormEditorTab } from "./editor/FormEditorTab";
import { FormEditorTabList } from "./editor/FormEditorTabList";
import { FormEditorTabTrigger } from "./editor/FormEditorTabTrigger";
import { FormEditorTools } from "./editor/FormEditorTools";

export { type FormEditorProviderProps, type FormEditorRegionProps } from "./editor/formTypes";

export const FormEditor = {
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
};
