import type { ReactNode } from "react";
import { CommandLink } from "@/features";
export const Link = ({ href, children }: { href: string; children: ReactNode }) => {
  return <CommandLink to={href}>{children}</CommandLink>;
};
