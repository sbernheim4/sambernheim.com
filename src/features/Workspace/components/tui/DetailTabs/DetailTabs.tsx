import { Box, Text, useInput } from "ink";
import { useState } from "react";
import type { DetailTab } from "../../renderer";
import { DetailSection } from "../DetailSection/DetailSection";
export const DetailTabs = ({ tabs }: { tabs: readonly DetailTab[] }) => {
  const [selected, setSelected] = useState(0);
  useInput((input, key) => {
    if (key.leftArrow || input === "h") setSelected((value) => Math.max(0, value - 1));
    else if (key.rightArrow || input === "l")
      setSelected((value) => Math.min(tabs.length - 1, value + 1));
  });
  return (
    <Box flexDirection="column">
      <Text dimColor>
        {tabs.map((tab, index) => (index === selected ? `[${tab.label}]` : tab.label)).join("  ")} ·
        h/l switch
      </Text>
      {tabs[selected] && (
        <DetailSection label={tabs[selected].label}>{tabs[selected].children}</DetailSection>
      )}
    </Box>
  );
};
