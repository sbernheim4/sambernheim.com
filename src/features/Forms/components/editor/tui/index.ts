import type { FormEditorRenderer } from "../renderer";
import { FormEditorProvider } from "./FormEditorProvider";
import { FormEditorTab, FormEditorTabList, FormEditorTabTrigger } from "./FormEditorTabs";
import { FormEditorActions } from "./FormEditorActions";
import { FormEditorOrchestratorProgress, FormEditorOrchestratorStatus } from "./FormEditorProgress";
import {
  Region,
  FormEditorTitle,
  FormEditorError,
  FormEditorDraftBanner,
  FormEditorUndo,
} from "./FormEditorRegions";
import { FormEditorViewModePicker } from "./FormEditorViewModePicker";

export const tuiFormEditorRenderer: FormEditorRenderer = {
  Provider: FormEditorProvider,
  TabList: FormEditorTabList,
  TabTrigger: FormEditorTabTrigger,
  Tab: FormEditorTab,
  Actions: FormEditorActions,
  OrchestratorProgress: FormEditorOrchestratorProgress,
  OrchestratorStatus: FormEditorOrchestratorStatus,
  Header: Region,
  Layout: Region,
  Main: Region,
  Content: Region,
  Tools: Region,
  Error: FormEditorError,
  DraftBanner: FormEditorDraftBanner,
  Undo: FormEditorUndo,
  Title: FormEditorTitle,
  ViewModePicker: FormEditorViewModePicker,
};
