import type { ReactNode } from "react";
import { Box, Text, useStdout } from "ink";

export const SiteLayout = ({
  pathname,
  children,
  maxWidth,
}: {
  pathname: string;
  children: ReactNode;
  maxWidth?: number;
}) => {
  const { stdout } = useStdout();
  const width = maxWidth
    ? Math.min(maxWidth, Math.max(40, (stdout.columns ?? 100) - 4))
    : Math.max(40, (stdout.columns ?? 100) - 4);
  return (
    <Box
      flexDirection="column"
      paddingY={1}
      width="100%"
      height={stdout.rows ?? 24}
      overflow="hidden"
    >
      <Box flexDirection="column" width={width} alignSelf="center">
        <Text bold color="cyan">
          Samuel Bernheim · Site TUI
        </Text>
        <Box borderStyle="round" borderColor="gray" paddingX={1} marginTop={1}>
          <Text dimColor>⌕ </Text>
          <Text color="cyan">sambernheim.com{pathname}</Text>
        </Box>
        <Box flexDirection="column" marginTop={1} width="100%">
          {children}
        </Box>
      </Box>
    </Box>
  );
};
