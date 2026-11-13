import { flexRender } from "@tanstack/react-table";
import { CycleableDate } from "@features/Dates/components/web/CycleableDate";
import "./Table.css";
import type { TableProps } from "../../props";

export const Table = ({ model, onSelect, interactive = false }: TableProps) => {
  const { table, query, controls } = model;
  return (
    <div className="data-table-scroll">
      {interactive && (
        <label className="app-field">
          <span>Filter rows</span>
          <input
            value={controls.query}
            onChange={(event) => {
              return model.setQuery(event.target.value);
            }}
          />
        </label>
      )}
      <table className="data-table">
        <thead>
          {table.getHeaderGroups().map((group) => {
            return (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className="data-table-sort"
                          onClick={() => {
                            return model.toggleSorting(header.column.id);
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody>
          {model.rows.length ? (
            model.rows.map((row) => {
              return (
                <tr
                  key={row.id}
                  data-selected={(interactive && controls.selectedId === row.id) || undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const value = String(cell.getValue() ?? "");
                    return (
                      <td
                        key={cell.id}
                        className={cell.column.id === "summary" ? "data-table-summary" : undefined}
                      >
                        {cell.column.id === "name" ? (
                          interactive ? (
                            <button
                              type="button"
                              className="data-table-name"
                              aria-pressed={controls.selectedId === row.id}
                              onClick={() => {
                                model.selectRow(row.id);
                                onSelect?.(row.original);
                              }}
                            >
                              {value}
                            </button>
                          ) : (
                            <a className="data-table-name" href={row.original.href}>
                              {value}
                            </a>
                          )
                        ) : cell.column.id === "status" ? (
                          <span className="status-pill" data-status={value}>
                            {value}
                          </span>
                        ) : cell.column.id === "publishedAt" ? (
                          <CycleableDate value={row.original.publishedAt ?? value} />
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={table.getVisibleLeafColumns().length} className="data-table-empty">
                {query || table.state.columnFilters.length
                  ? "No matching records."
                  : "No records yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
