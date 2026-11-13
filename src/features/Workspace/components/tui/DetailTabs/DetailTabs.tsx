import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { Box, Text } from "ink";
import type { DetailTab } from "../../renderer";
import { DetailSection } from "../DetailSection/DetailSection";
import { useDetailTabsModel } from "../../../hooks/useDetailTabsModel";
export const DetailTabs = ({
  tabs,
  value,
  onValueChange,
}: {
  tabs: readonly DetailTab[];
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  const { selectedIndex: selected, select: selectValue } = useDetailTabsModel(
    tabs,
    value,
    onValueChange,
  );
  const select = (index: number) => {
    if (tabs[index]) {
      selectValue(tabs[index].value);
    }
  };
  useTuiInput((input) => {
    if (input === "h") {
      select(Math.max(0, selected - 1));
    } else if (input === "l") {
      select(Math.min(tabs.length - 1, selected + 1));
    }
  });
  return (
    <Box flexDirection="column">
      <Text>
        {tabs.map((tab, index) => {
          const isSelected = index === selected;
          return (
            <Text key={tab.value} color={isSelected ? "yellow" : undefined} dimColor={!isSelected}>
              {isSelected ? `[${tab.label}]` : tab.label}
              {index < tabs.length - 1 ? "  " : ""}
            </Text>
          );
        })}
        <Text dimColor> · h/l switch</Text>
      </Text>
      {tabs[selected] && (
        <DetailSection label={tabs[selected].label} showLabel={false}>
          {tabs[selected].children}
        </DetailSection>
      )}
    </Box>
  );
};
