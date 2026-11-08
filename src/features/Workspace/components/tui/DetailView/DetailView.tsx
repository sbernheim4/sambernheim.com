import type { DetailTab } from "../../renderer";
import { DetailTabs } from "../DetailTabs/DetailTabs";
import { Box } from "ink";
import { DetailSection } from "../DetailSection/DetailSection";
import { ViewModePicker, useViewModePreference } from "../ViewModePreference/ViewModePreference";
export const DetailView = ({ tabs }: { tabs: readonly DetailTab[] }) => {
  const { mode, updateMode } = useViewModePreference();
  return (
    <Box flexDirection="column">
      <ViewModePicker mode={mode} onChange={updateMode} />
      {mode === "page" ? (
        tabs.map((tab) => {
          return (
            <DetailSection key={tab.value} label={tab.label}>
              {tab.children}
            </DetailSection>
          );
        })
      ) : (
        <DetailTabs tabs={tabs} />
      )}
    </Box>
  );
};
