import { useFormEditorContext } from "@features/Forms/hooks/useFormEditorContext";
import { SegmentedTabContent } from "@features/UI/components/web/SegmentedTabs";
import { FullPageSection } from "./FullPageSection";
import type { FormEditorTabProps } from "../formTypes";
import "./FormEditorTab.css";

export const FormEditorTab = ({ name, label = name, children }: FormEditorTabProps) => {
  const { activeTab, viewMode } = useFormEditorContext();
  const active = activeTab === name;

  if ((viewMode === "tabs" || viewMode === "sidebar") && !active) {
    return null;
  }

  if (viewMode === "page") {
    return (
      <FullPageSection
        className="form-editor-tab form-editor-page-section"
        dataState="active"
        label={label}
      >
        {children}
      </FullPageSection>
    );
  }

  return (
    <SegmentedTabContent value={name} className="form-editor-tab">
      {children}
    </SegmentedTabContent>
  );
};
