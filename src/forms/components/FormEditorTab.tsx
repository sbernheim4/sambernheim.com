import type { ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useFormEditorContext } from "../hooks/useFormEditorContext";
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
    <Tabs.Content value={name} className="form-editor-tab" data-state="active">
      {children}
    </Tabs.Content>
  );
};
