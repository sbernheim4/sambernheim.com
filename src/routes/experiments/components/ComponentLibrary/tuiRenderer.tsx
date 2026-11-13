import { Box, Text } from "ink";
import { CommandPalette as BaseCommandPalette } from "@/features/CommandPalette/components/tui/CommandPalette";
import { Table } from "@/features/Table/components/tui/Table";
import { DetailTabs } from "@/features/Workspace/components/tui/DetailTabs/DetailTabs";
import { DetailSection } from "@/features/Workspace/components/tui/DetailSection/DetailSection";
import { CycleableDateTime } from "@/features/Dates/components/tui/CycleableDateTime";
import type { ComponentRenderer } from "./renderer";

export const tuiComponentRenderer: ComponentRenderer = {
  CommandPalette: BaseCommandPalette,
  Table,
  DetailTabs,
  DetailSection,
  CycleableDateTime,
  Text: ({ children, muted, dimColor }) => {
    return <Text dimColor={muted || dimColor}>{children}</Text>;
  },
  Stack: ({ children, gap = 1 }) => {
    return (
      <Box flexDirection="column" gap={gap}>
        {children}
      </Box>
    );
  },
  Form: ({ children }) => {
    return <Box flexDirection="column">{children}</Box>;
  },
};
