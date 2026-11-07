import { SegmentedTabs, type SegmentedTab } from "@/features";
import { DetailSection } from "./DetailSection";

export type DetailTab = SegmentedTab;

export const DetailTabs = ({ tabs }: { tabs: readonly DetailTab[] }) => {
  return (
    <SegmentedTabs
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
