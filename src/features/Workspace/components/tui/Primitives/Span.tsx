import { Text } from "ink";
import type { ReactNode } from "react";
export const Span = ({ children }: { children: ReactNode; className?: string }) => (
  <Text dimColor>{children}</Text>
);
