import { Box } from "ink";
import type { ReactNode } from "react";
export const Section = ({ children }: { children: ReactNode; className?: string }) => (
  <Box flexDirection="column" marginTop={1}>
    {children}
  </Box>
);
