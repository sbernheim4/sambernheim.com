import type { ColumnFiltersState, OnChangeFn, SortingState } from "@tanstack/react-table";
export type TableControls = {
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  query: string;
  onQueryChange: (query: string) => void;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  selectedId: string | null;
  onSelectedIdChange: (id: string | null) => void;
};
