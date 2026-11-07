import { useMemo, useState } from "react";
import { flexRender, useTable } from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  rowSortingFeature,
  createSortedRowModel,
  createColumnHelper,
  tableFeatures,
} from "@tanstack/table-core";
import "./EntityTable.css";

export type EntityTableRecord = {
  id: string;
  name: string;
  status: string;
  summary: string;
  href: string;
};
const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel() });
const column = createColumnHelper<typeof features, EntityTableRecord>();

export function EntityTable({ data }: { data: EntityTableRecord[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<typeof features, EntityTableRecord, any>[]>(
    () => [
      column.accessor("name", {
        header: "Name",
        cell: ({ row }) => (
          <a className="entity-table-name" href={row.original.href}>
            {row.original.name}
          </a>
        ),
      }),
      column.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <span className="status-pill" data-status={row.original.status}>
            {row.original.status}
          </span>
        ),
      }),
      column.accessor("summary", {
        header: "Details",
        cell: ({ row }) => <span className="entity-table-summary">{row.original.summary}</span>,
      }),
    ],
    [],
  );
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (row) => row.id,
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div className="entity-table-scroll">
      <table className="entity-table">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} scope="col">
                  {header.isPlaceholder ? null : (
                    <button
                      className="entity-table-sort"
                      onClick={header.column.getToggleSortingHandler()}
                      aria-label={`Sort by ${header.column.id}`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span aria-hidden="true">
                        {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as "asc" | "desc"] ??
                          ""}
                      </span>
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getAllCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="entity-table-empty" colSpan={columns.length}>
                No records yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
