import { SegmentedTabs, type SegmentedTab } from "@/features";

export type DetailTab = SegmentedTab;

export const DetailTabs = ({ tabs }: { tabs: readonly DetailTab[] }) => {
  return <SegmentedTabs tabs={tabs} ariaLabel="Entity details" />;
};
