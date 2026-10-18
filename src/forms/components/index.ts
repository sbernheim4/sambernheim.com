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
import { FormEditorUndo } from "./FormEditorUndo";
import { FormEditorProvider } from "./FormEditorProvider";
import { FormEditorTab } from "./FormEditorTab";
import { FormEditorTabList } from "./FormEditorTabList";
import { FormEditorTabTrigger } from "./FormEditorTabTrigger";
import { FormEditorTools } from "./FormEditorTools";

export { type FormEditorProviderProps, type FormEditorRegionProps } from "./formTypes";
export {
  CycleableDateTime,
  CycleableDateTimeProvider,
  useCycleableDateTimeMode,
} from "./CycleableDateTime";
export { CycleableDate } from "./CycleableDate";

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
