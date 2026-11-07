import { useState } from "react";
import { useTable } from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/table-core";

export type EntityTableRecord = {
  id: string;
  name: string;
  status: string;
  summary: string;
  href: string;
};
const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel() });
const column = createColumnHelper<typeof features, EntityTableRecord>();
const columns: ColumnDef<typeof features, EntityTableRecord, any>[] = [
  column.accessor("name", { header: "Name" }),
  column.accessor("status", { header: "Status" }),
  column.accessor("summary", { header: "Details" }),
];

export function useEntityTable(data: EntityTableRecord[]) {
  const [sorting, setSorting] = useState<SortingState>([]);
  return useTable({
    features,
    columns,
    data,
    getRowId: (row) => {
      return row.id;
    },
    state: { sorting },
    onSortingChange: setSorting,
  });
}
