import { Text } from "ink";
import type { ReactNode } from "react";
export const Span = ({ children }: { children: ReactNode; className?: string }) => {
  return <Text dimColor>{children}</Text>;
};
