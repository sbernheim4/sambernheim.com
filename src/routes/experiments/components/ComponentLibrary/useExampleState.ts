import { useTableModel } from "@/features/Table/model";
import { useState } from "react";
import { useAppForm } from "@/features/Forms/hooks/useAppForm";
import type { CycleableDateTimeMode } from "@/features/Dates";
import { tableRecords, type ComponentId } from "./catalog";
import {
  useCommandPaletteModel,
  useCommandActions,
  type CommandPaletteState,
} from "@/features/CommandPalette/model";
import type { TableControls } from "@/features/Table/controls";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";

export const useExampleState = () => {
  const form = useAppForm({ defaultValues: { title: "Website refresh", status: "planned" } });
  const [tab, onTabChange] = useState("overview");
  const [sectionOpen, onSectionOpenChange] = useState(true);
  const [dateMode, onDateModeChange] = useState<CycleableDateTimeMode>("utc");
  const [commandQuery, setCommandQuery] = useState("");
  const [commandSelected, setCommandSelected] = useState(0);
  const commandActions = useCommandActions();
  const commandState: CommandPaletteState = {
    open: true,
    query: commandQuery,
    setQuery: (query) => {
      setCommandQuery(query);
      setCommandSelected(0);
    },
    selected: commandSelected,
    setSelected: setCommandSelected,
    toggle: () => {},
    close: () => {},
  };
  const [tableQuery, setTableQuery] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [tableSorting, setTableSorting] = useState<SortingState>([]);
  const [tableSelectedId, setTableSelectedId] = useState<string | null>(tableRecords[0].id);
  const tableControls: TableControls = {
    columnFilters,
    onColumnFiltersChange: setColumnFilters,
    query: tableQuery,
    onQueryChange: (query) => {
      setTableQuery(query);
      setTableSelectedId(null);
    },
    sorting: tableSorting,
    onSortingChange: setTableSorting,
    selectedId: tableSelectedId,
    onSelectedIdChange: setTableSelectedId,
  };
  const commandModel = useCommandPaletteModel(commandActions, commandState);
  const tableModel = useTableModel(tableRecords, { controls: tableControls });
  return {
    commandModel,
    tableModel,
    commandState,
    commandActions,
    tableControls,
    form,
    tab,
    onTabChange,
    sectionOpen,
    onSectionOpenChange,
    dateMode,
    onDateModeChange,
    reset: () => {
      setCommandQuery("");
      setCommandSelected(0);
      setTableQuery("");
      setTableSorting([]);
      setColumnFilters([]);
      setTableSelectedId(tableRecords[0].id);
      form.reset();
      onTabChange("overview");
      onSectionOpenChange(true);
      onDateModeChange("utc");
    },
  };
};
export type ExampleProps = Omit<ReturnType<typeof useExampleState>, "reset"> & { id: ComponentId };
