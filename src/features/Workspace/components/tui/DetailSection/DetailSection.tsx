import { Box, Text } from "ink";
import type { ReactNode } from "react";
export const DetailSection = ({
  label,
  children,
  showLabel = true,
}: {
  label: string;
  children: ReactNode;
  collapsible?: boolean;
  showLabel?: boolean;
}) => (
  <Box flexDirection="column" marginTop={1}>
    {showLabel && (
      <Text bold color="yellow">
        {label.toUpperCase()}
      </Text>
    )}
    {children}
  </Box>
);
