import type { ComponentType } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useFormEditorContext } from "../hooks/useFormEditorContext";

export type FormEditorTabTriggerProps = {
  name: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
};

export const FormEditorTabTrigger = ({ name, label, icon: Icon, disabled }: FormEditorTabTriggerProps) => {
  const { activeTab, setActiveTab } = useFormEditorContext();
  const active = activeTab === name;
  return (
    <Tabs.Trigger value={name} className="form-editor-tab-trigger" data-state={active ? "active" : "inactive"}
      disabled={disabled} onClick={() => setActiveTab(name)}>
      {Icon && <Icon className="form-editor-tab-icon" />}{label}
    </Tabs.Trigger>
  );
};
