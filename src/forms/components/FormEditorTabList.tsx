import type { FormEditorRegionProps } from "./formTypes";
import * as Tabs from "@radix-ui/react-tabs";
import { useFormEditorContext } from "../hooks/useFormEditorContext";

export const FormEditorTabList = ({ children, className }: FormEditorRegionProps) => {
  const { viewMode } = useFormEditorContext();

  if (viewMode === "page") {
    return null;
  }

  return <Tabs.List className={className ?? "form-editor-tab-list"}>{children}</Tabs.List>;
};
