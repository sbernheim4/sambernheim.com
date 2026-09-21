import type { ComponentType } from "react";
import { useFormEditorContext } from "../hooks/useFormEditorContext";
import { SegmentedTabTrigger } from "../../shared/components/SegmentedTabs";

export type FormEditorTabTriggerProps = {
  name: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
};

export const FormEditorTabTrigger = ({
  name,
  label,
  icon: Icon,
  disabled,
}: FormEditorTabTriggerProps) => {
  const { setActiveTab } = useFormEditorContext();
  return (
    <SegmentedTabTrigger
      value={name}
      icon={Icon}
      disabled={disabled}
      onClick={() => {
        return setActiveTab(name);
      }}
    >
      {label}
    </SegmentedTabTrigger>
  );
};
