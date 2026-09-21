import type { FormEditorRegionProps } from "./formTypes";
import { useFormEditorContext } from "../hooks/useFormEditorContext";
import { SegmentedTabList } from "../../shared/components/SegmentedTabs";

export const FormEditorTabList = ({ children, className }: FormEditorRegionProps) => {
  const { viewMode } = useFormEditorContext();

  if (viewMode === "page") {
    return null;
  }

  return <SegmentedTabList className={className}>{children}</SegmentedTabList>;
};
