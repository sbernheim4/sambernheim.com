import type { TableControls } from "./controls";
import { useMemo, useState } from "react";
import { useTable as useTanStackTable } from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  OnChangeFn,
} from "@tanstack/react-table";
import {
  createColumnHelper,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  filterFn_includesString,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/table-core";

export type TableRecord = {
  id: string;
  name: string;
  status: string;
  summary: string;
  href: string;
  publishedAt?: string;
};
export type TableVariant = "entities" | "articles";
export type TableModelOptions = {
  controls?: TableControls;
  variant?: TableVariant;
};
const features = tableFeatures({
  columnVisibilityFeature,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});
const column = createColumnHelper<typeof features, TableRecord>();
export const useTable = (
  data: TableRecord[],
  includePublishedAt = false,
  variant: TableVariant = "entities",
  controlled?: {
    sorting: SortingState;
    onSortingChange: OnChangeFn<SortingState>;
    columnFilters?: ColumnFiltersState;
    onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
    onSelectedIdChange?: (id: string | null) => void;
  },
) => {
  const [localColumnFilters, setLocalColumnFilters] = useState<ColumnFiltersState>([]);
  const columnFilters = controlled?.columnFilters ?? localColumnFilters;
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const sorting = controlled?.sorting ?? localSorting;
  const setSorting = controlled?.onSortingChange ?? setLocalSorting;
  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    (controlled?.onColumnFiltersChange ?? setLocalColumnFilters)(updater);
    controlled?.onSelectedIdChange?.(null);
  };
  const columns: ColumnDef<typeof features, TableRecord, any>[] = [
    column.accessor("name", { header: "Name", filterFn: "includesString" }),
    ...(variant === "articles"
      ? []
      : [
          column.accessor("status", {
            header: "Status",
            filterFn: "includesString",
          }),
        ]),
    column.accessor("summary", {
      header: "Details",
      filterFn: "includesString",
    }),
    ...(includePublishedAt
      ? [
          column.accessor("publishedAt", {
            header: "Date",
            filterFn: "includesString",
          }),
        ]
      : []),
  ];
  return useTanStackTable({
    features,
    columns,
    data,
    getRowId: (row) => {
      return row.id;
    },
    state: { sorting, columnFilters },
    onColumnFiltersChange,
    onSortingChange: setSorting,
  });
};

// One model can be passed to React DOM and Ink. The renderers only map its
// columns/rows to their own elements and translate input into model actions.
export const useTableModel = (data: TableRecord[], options: TableModelOptions = {}) => {
  const { controls: externalControls, variant = "entities" } = options;
  const [localQuery, setLocalQuery] = useState("");
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(data[0]?.id ?? null);
  const controls: TableControls = externalControls ?? {
    query: localQuery,
    onQueryChange: (query) => {
      setLocalQuery(query);
      setLocalSelectedId(null);
    },
    sorting: localSorting,
    onSortingChange: setLocalSorting,
    selectedId: localSelectedId,
    onSelectedIdChange: setLocalSelectedId,
  };
  const query = controls.query;
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return data.filter((record) => {
      return `${record.name} ${record.status} ${record.summary}`.toLowerCase().includes(normalized);
    });
  }, [data, query]);
  const hasDates = data.some((record) => {
    return Boolean(record.publishedAt);
  });
  const table = useTable(filtered, hasDates, variant, controls);
  const setQuery = (nextQuery: string) => {
    return controls.onQueryChange(nextQuery);
  };
  const setColumnFilter = (columnId: string, value: unknown) => {
    table.getColumn(columnId)?.setFilterValue(value);
  };
  const toggleSorting = (columnId: string) => {
    table.getColumn(columnId)?.toggleSorting();
  };
  const selectRow = (id: string | null) => {
    return controls.onSelectedIdChange(id);
  };
  return {
    table,
    rows: table.getRowModel().rows,
    filtered,
    hasDates,
    query,
    controls,
    variant,
    setQuery,
    setColumnFilter,
    toggleSorting,
    selectRow,
  };
};
export type TableModel = ReturnType<typeof useTableModel>;
