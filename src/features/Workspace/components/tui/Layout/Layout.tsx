import { Box, Text } from "ink";
import type { ReactNode } from "react";
import { LinkNavigation } from "../Primitives/Link";
export const Shell = ({ children }: { children: ReactNode }) => (
  <Box flexDirection="column">{children}</Box>
);
export const DetailLayout = ({
  title,
  editTo,
  children,
}: {
  title: string;
  editTo: string;
  children: ReactNode;
}) => (
  <LinkNavigation>
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="cyan">
        {title}
      </Text>
      <Text dimColor>j/k select link · Enter open · edit: {editTo}</Text>
      {children}
    </Box>
  </LinkNavigation>
);
export const Status = ({ value }: { value: string }) => <Text color="green">{value}</Text>;
export const Loading = () => <Text dimColor>Loading…</Text>;
export const Missing = () => <Text color="red">Entity not found.</Text>;
