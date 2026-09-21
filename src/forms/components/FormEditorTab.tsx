import type { ReactNode } from "react";
import { useFormEditorContext } from "../hooks/useFormEditorContext";
import { SegmentedTabContent } from "../../shared/components/SegmentedTabs";
import "./FormEditorTab.css";

export type FormEditorTabProps = { name: string; children: ReactNode; forceReload?: boolean };

export const FormEditorTab = ({ name, children }: FormEditorTabProps) => {
  const { activeTab, viewMode } = useFormEditorContext();
  const active = activeTab === name;

  if (viewMode === "tabs" && !active) {
    return null;
  }

  if (viewMode === "page") {
    return (
      <section className="form-editor-tab form-editor-page-section" data-state="active">
        {children}
      </section>
    );
  }

  return (
    <SegmentedTabContent value={name} className="form-editor-tab">
      {children}
    </SegmentedTabContent>
  );
};
