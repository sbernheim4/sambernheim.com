import type { ReactNode } from "react";
export const Section = ({ children, className }: { children: ReactNode; className?: string }) => (
  <section className={className}>{children}</section>
);
