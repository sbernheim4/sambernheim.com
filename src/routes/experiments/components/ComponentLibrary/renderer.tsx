import { createContext, useContext, type ComponentType, type ReactNode } from "react";
import type { CommandPaletteMode, CommandPaletteModel } from "@/features/CommandPalette/model";
import type { TableProps as FeatureTableProps } from "@/features/Table/props";

export type CommandPaletteProps = {
  model: CommandPaletteModel;
  mode?: CommandPaletteMode;
};
export type TableProps = FeatureTableProps;
export type TextProps = {
  children: ReactNode;
  muted?: boolean;
  dimColor?: boolean;
  role?: "status" | "alert";
};
export type StackProps = { children: ReactNode; gap?: number };
export type DetailTab = { value: string; label: string; children: ReactNode };
export type DetailTabsProps = {
  tabs: readonly DetailTab[];
  value?: string;
  onValueChange?: (value: string) => void;
};
export type DetailSectionProps = {
  label: string;
  children: ReactNode;
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showLabel?: boolean;
};
export type CycleableDateTimeProps = { value: Date };
export type FormProps = { children: ReactNode };

// The shared composition depends on this contract, never on a DOM or Ink import.
export type ComponentRenderer = {
  CommandPalette: ComponentType<CommandPaletteProps>;
  Table: ComponentType<TableProps>;
  Text: ComponentType<TextProps>;
  Stack: ComponentType<StackProps>;
  DetailTabs: ComponentType<DetailTabsProps>;
  DetailSection: ComponentType<DetailSectionProps>;
  CycleableDateTime: ComponentType<CycleableDateTimeProps>;
  Form: ComponentType<FormProps>;
};

type RendererContextValue = {
  renderer: ComponentRenderer;
};
const RendererContext = createContext<RendererContextValue | null>(null);

export const ComponentRendererProvider = ({
  children,
  ...value
}: RendererContextValue & { children: ReactNode }) => {
  return <RendererContext.Provider value={value}>{children}</RendererContext.Provider>;
};

const useRenderer = () => {
  const context = useContext(RendererContext);
  if (!context) {
    throw new Error("ComponentRendererProvider is missing");
  }
  return context;
};

export const CommandPalette = ({ mode = "inline", ...props }: CommandPaletteProps) => {
  const { renderer } = useRenderer();
  const Render = renderer.CommandPalette;
  return <Render {...props} mode={mode} />;
};
export const Table = (props: TableProps) => {
  const { renderer } = useRenderer();
  const Render = renderer.Table;
  return <Render {...props} />;
};
export const Text = (props: TextProps) => {
  const { renderer } = useRenderer();
  const Render = renderer.Text;
  return <Render {...props} />;
};
export const Stack = (props: StackProps) => {
  const { renderer } = useRenderer();
  const Render = renderer.Stack;
  return <Render {...props} />;
};
export const DetailTabs = (props: DetailTabsProps) => {
  const { renderer } = useRenderer();
  const Render = renderer.DetailTabs;
  return <Render {...props} />;
};
export const DetailSection = (props: DetailSectionProps) => {
  const { renderer } = useRenderer();
  const Render = renderer.DetailSection;
  return <Render {...props} />;
};
export const CycleableDateTime = (props: CycleableDateTimeProps) => {
  const { renderer } = useRenderer();
  const Render = renderer.CycleableDateTime;
  return <Render {...props} />;
};
export const Form = (props: FormProps) => {
  const { renderer } = useRenderer();
  const Render = renderer.Form;
  return <Render {...props} />;
};
