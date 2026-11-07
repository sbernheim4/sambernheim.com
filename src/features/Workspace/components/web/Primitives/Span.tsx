import type { ReactNode } from "react";
export const Span = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={className}>{children}</span>
);
