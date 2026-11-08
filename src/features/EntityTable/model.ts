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
  publishedAt?: string;
};
const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel() });
const column = createColumnHelper<typeof features, EntityTableRecord>();
export const useEntityTable = (data: EntityTableRecord[], includePublishedAt = false) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns: ColumnDef<typeof features, EntityTableRecord, any>[] = [
    column.accessor("name", { header: "Name" }),
    column.accessor("status", { header: "Status" }),
    column.accessor("summary", { header: "Details" }),
    ...(includePublishedAt ? [column.accessor("publishedAt", { header: "Date" })] : []),
  ];
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
};
