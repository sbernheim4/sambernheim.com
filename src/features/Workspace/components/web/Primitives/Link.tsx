import type { ReactNode } from "react";
import { CommandLink } from "@/features";
export const Link = ({ href, children }: { href: string; children: ReactNode }) => (
  <CommandLink to={href}>{children}</CommandLink>
);
