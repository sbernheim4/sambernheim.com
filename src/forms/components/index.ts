import { FormEditorActions } from "./FormEditorActions";
import { FormEditorContent } from "./FormEditorContent";
import { FormEditorError } from "./FormEditorError";
import { FormEditorHeader } from "./FormEditorHeader";
import { FormEditorLayout } from "./FormEditorLayout";
import { FormEditorMain } from "./FormEditorMain";
import { FormEditorProvider } from "./FormEditorProvider";
import { FormEditorTab } from "./FormEditorTab";
import { FormEditorTabList } from "./FormEditorTabList";
import { FormEditorTabTrigger } from "./FormEditorTabTrigger";
import { FormEditorTools } from "./FormEditorTools";

export { type FormEditorProviderProps, type FormEditorRegionProps } from "./formTypes";

export const FormEditor = {
  Actions: FormEditorActions,
  Content: FormEditorContent,
  Error: FormEditorError,
  Header: FormEditorHeader,
  Layout: FormEditorLayout,
  Main: FormEditorMain,
  Provider: FormEditorProvider,
  Tab: FormEditorTab,
  TabList: FormEditorTabList,
  TabTrigger: FormEditorTabTrigger,
  Tools: FormEditorTools,
};
