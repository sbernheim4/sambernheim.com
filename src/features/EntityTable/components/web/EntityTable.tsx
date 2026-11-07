import { flexRender } from "@tanstack/react-table";
import type { EntityTableRecord } from "../../model";
import { useEntityTable } from "../../model";
import "./EntityTable.css";

export function EntityTable({ data }: { data: EntityTableRecord[] }) {
  const table = useEntityTable(data);
  return (
    <div className="entity-table-scroll">
      <table className="entity-table">
        <thead>
          {table.getHeaderGroups().map((group) => {
            return (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <button
                        className="entity-table-sort"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            );
          })}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  <td>
                    <a className="entity-table-name" href={row.original.href}>
                      {row.original.name}
                    </a>
                  </td>
                  <td>
                    <span className="status-pill" data-status={row.original.status}>
                      {row.original.status}
                    </span>
                  </td>
                  <td className="entity-table-summary">{row.original.summary}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} className="entity-table-empty">
                No records yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
