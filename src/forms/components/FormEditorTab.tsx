import type { ReactNode } from "react";
import { useFormEditorContext } from "../hooks/useFormEditorContext";
import { SegmentedTabContent } from "../../shared/components/SegmentedTabs";
import { FullPageSection } from "../../pages/form-demo/components/FullPageSection";
import "./FormEditorTab.css";

export type FormEditorTabProps = { name: string; label?: string; children: ReactNode };

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
