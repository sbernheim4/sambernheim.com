import { createContext, useContext, type ComponentType, type ReactNode } from "react";
import type { EntityTableRecord } from "@features/EntityTable/model";

export type DetailTab = { value: string; label: string; children: ReactNode };
export type WorkspaceRenderer = {
  Section: ComponentType<{ children: ReactNode; className?: string }>;
  Span: ComponentType<{ children: ReactNode; className?: string }>;
  Link: ComponentType<{ href: string; children: ReactNode }>;
  DetailLayout: ComponentType<{ title: string; editTo: string; children: ReactNode }>;
  DetailView: ComponentType<{ tabs: readonly DetailTab[] }>;
  DetailProperties: ComponentType<{ properties: readonly { label: string; value: ReactNode }[] }>;
  ChildList: ComponentType<{ children: ReactNode }>;
  ProfileSummary: ComponentType<{ id: string }>;
  Status: ComponentType<{ value: string }>;
  Loading: ComponentType;
  Missing: ComponentType;
  DateTime: ComponentType<{ value: Date }>;
  Number: ComponentType<{ value: number }>;
  EntityList: ComponentType<{
    title: string;
    createHref: string;
    createLabel: string;
    data: EntityTableRecord[];
    loading: boolean;
  }>;
};

export const WorkspaceRendererContext = createContext<WorkspaceRenderer | null>(null);

export const useWorkspaceRenderer = () => {
  const renderer = useContext(WorkspaceRendererContext);
  if (!renderer) {
    throw new Error("WorkspaceRendererProvider is missing");
  }
  return renderer;
};
