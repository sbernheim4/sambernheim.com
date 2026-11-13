import { SegmentedTabs, type SegmentedTab } from "@/features";
import { DetailSection } from "../DetailSection/DetailSection";
import { useDetailTabsModel } from "../../../hooks/useDetailTabsModel";

export type DetailTab = SegmentedTab;

export const DetailTabs = ({
  tabs,
  value,
  onValueChange,
}: {
  tabs: readonly DetailTab[];
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  const model = useDetailTabsModel(tabs, value, onValueChange);
  return (
    <SegmentedTabs
      value={model.activeValue}
      onValueChange={model.select}
      tabs={tabs.map((tab) => {
        return {
          ...tab,
          children: (
            <DetailSection label={tab.label} showLabel={false}>
              {tab.children}
            </DetailSection>
          ),
        };
      })}
      ariaLabel="Entity details"
    />
  );
};
