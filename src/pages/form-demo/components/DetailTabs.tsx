import { SegmentedTabs, type SegmentedTab } from "../../../shared/components/SegmentedTabs";

export type DetailTab = SegmentedTab;

export const DetailTabs = ({ tabs }: { tabs: readonly DetailTab[] }) => {
  return <SegmentedTabs tabs={tabs} ariaLabel="Entity details" />;
};
