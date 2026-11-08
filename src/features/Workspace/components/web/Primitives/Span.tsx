import type { ReactNode } from "react";
export const Span = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <span className={className}>{children}</span>;
};
