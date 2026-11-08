import { Box, Text } from "ink";
import type { ReactNode } from "react";
import { Link, LinkNavigation } from "../Primitives/Link";
export const Shell = ({ children }: { children: ReactNode }) => {
  return <Box flexDirection="column">{children}</Box>;
};
export const DetailLayout = ({
  title,
  editTo,
  children,
}: {
  title: string;
  editTo: string;
  children: ReactNode;
}) => {
  return (
    <LinkNavigation>
      <Box flexDirection="column" marginTop={1}>
        <Text bold color="cyan">
          {title}
        </Text>
        <Link href={editTo}>Edit</Link>
        {children}
      </Box>
    </LinkNavigation>
  );
};
export const Status = ({ value }: { value: string }) => {
  return <Text color="green">{value}</Text>;
};
export const Loading = () => {
  return <Text dimColor>Loading…</Text>;
};
export const Missing = () => {
  return <Text color="red">Entity not found.</Text>;
};
