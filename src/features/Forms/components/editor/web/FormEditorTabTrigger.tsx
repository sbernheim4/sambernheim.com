import { useFormEditorContext } from "@features/Forms/hooks/useFormEditorContext";
import { SegmentedTabTrigger } from "@features/UI/components/web/SegmentedTabs";
import type { FormEditorTabTriggerProps } from "../formTypes";

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
