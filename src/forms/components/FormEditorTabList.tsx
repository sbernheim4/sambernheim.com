import type { FormEditorRegionProps } from "./formTypes";
import * as Tabs from "@radix-ui/react-tabs";

export const FormEditorTabList = ({ children, className }: FormEditorRegionProps) => (
  <Tabs.List className={className ?? "form-editor-tab-list"}>{children}</Tabs.List>
);
