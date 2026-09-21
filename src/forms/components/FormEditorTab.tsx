import type { ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useFormEditorContext } from "../hooks/useFormEditorContext";

export type FormEditorTabProps = { name: string; children: ReactNode; forceReload?: boolean };

export const FormEditorTab = ({ name, children }: FormEditorTabProps) => {
  const active = useFormEditorContext().activeTab === name;
  if (!active) {
    return null;
  }
  return (
    <Tabs.Content value={name} className="form-editor-tab" data-state="active">
      {children}
    </Tabs.Content>
  );
};
