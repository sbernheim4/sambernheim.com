import { CommandPalette } from "@/features/CommandPalette/components/web/CommandPalette";
import { Table } from "@/features/Table/components/web/Table";
import { DetailTabs } from "@/features/Workspace/components/web/DetailTabs/DetailTabs";
import { DetailSection } from "@/features/Workspace/components/web/DetailSection/DetailSection";
import { CycleableDateTime } from "@/features/Dates";
import type { ComponentRenderer } from "./renderer";

export const webComponentRenderer: ComponentRenderer = {
  CommandPalette,
  Table,
  DetailTabs,
  DetailSection,
  CycleableDateTime,
  Text: ({ children, muted, dimColor, role }) => {
    return (
      <p role={role} style={muted || dimColor ? { color: "var(--color-text-muted)" } : undefined}>
        {children}
      </p>
    );
  },
  Stack: ({ children, gap = 1 }) => {
    return <div style={{ display: "flex", flexDirection: "column", gap: gap * 8 }}>{children}</div>;
  },
  Form: ({ children }) => {
    return (
      <form
        onSubmit={(event) => {
          return event.preventDefault();
        }}
      >
        {children}
      </form>
    );
  },
};
