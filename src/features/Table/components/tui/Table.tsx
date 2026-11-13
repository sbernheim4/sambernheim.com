import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { CycleableDate } from "@features/Dates/components/tui/CycleableDate";
import { Box, Text } from "ink";
import { useState } from "react";
import type { TableProps } from "../../props";
import { useTuiInputMode } from "@features/Workspace/components/tui/Primitives/InputMode";
import { useCycleableDateTimeMode } from "@features/Dates/hooks/useCycleableDateTimeMode";
import { tuiRouter } from "@features/Site/tuiRouter";
import { useTerminalColumns } from "../../hooks/tui/useTerminalColumns";

export const Table = ({ onSelect, model, interactive = false }: TableProps) => {
  const { table, rows, hasDates } = model;
  const controls = model.controls;
  const [lastKey, setLastKey] = useState("");
  const search = model.query;
  const setSearch = (next: string | ((value: string) => string)) => {
    model.setQuery(typeof next === "function" ? next(search) : next);
  };
  const [filterColumnId, setFilterColumnId] = useState<string | null>(null);
  const [dateFocused, setDateFocused] = useState(false);
  const { mode: dateMode, setMode: setDateMode } = useCycleableDateTimeMode();
  const { mode, setMode } = useTuiInputMode();
  const terminalColumns = useTerminalColumns();
  const selected =
    controls.selectedId === null
      ? -1
      : rows.findIndex((row) => {
          return row.id === controls.selectedId;
        });
  const setSelected = (next: number | ((value: number) => number)) => {
    const index = typeof next === "function" ? next(selected) : next;
    controls.onSelectedIdChange(rows[index]?.id ?? null);
  };
  const activeIndex = Math.max(0, Math.min(selected, rows.length - 1));
  const date = rows[activeIndex]?.original.publishedAt;
  const pageSize = 12;
  const width = Math.max(28, terminalColumns - 4);
  const columnIds = table.getVisibleLeafColumns().map((column) => {
    return column.id;
  });
  // Use natural text widths for the identifying columns, then give details
  // the remaining viewport. Rendering uses the same TanStack columns and rows.
  const gap = 2;
  const available = width - gap * (columnIds.length - 1);
  const naturalWidth = (id: string) => {
    return Math.max(
      String(table.getColumn(id)?.columnDef.header ?? id).length +
        (table.getColumn(id)?.getIsSorted() ? 2 : 0) +
        (table.getColumn(id)?.getIsFiltered() ? 2 : 0),
      ...rows.map((row) => {
        return String(row.getValue(id) ?? "").length;
      }),
    );
  };
  const dateWidth = hasDates
    ? Math.min(naturalWidth("publishedAt"), Math.floor(available * 0.27))
    : 0;
  const statusWidth = columnIds.includes("status")
    ? Math.min(naturalWidth("status"), Math.max(6, Math.floor(available * 0.25)))
    : 0;
  const nameWidth = Math.min(
    naturalWidth("name"),
    Math.max(4, available - statusWidth - dateWidth - 7),
  );
  const widths: Record<string, number> = {
    name: nameWidth,
    status: statusWidth,
    summary: available - nameWidth - statusWidth - dateWidth,
    publishedAt: dateWidth,
  };
  const columns = columnIds.map((id) => {
    return {
      id,
      width: widths[id],
      column: table.getColumn(id)!,
    };
  });
  const cellText = (value: string, width: number) => {
    const text = value.replace(/\s+/g, " ");
    const clipped = text.length > width ? text.slice(0, Math.max(0, width - 1)) + "…" : text;
    return clipped.padEnd(width).slice(0, width);
  };
  const start = Math.max(
    0,
    Math.min(activeIndex - Math.floor(pageSize / 2), rows.length - pageSize),
  );
  const activeFilterColumn = filterColumnId ? table.getColumn(filterColumnId) : undefined;
  const activeFilterValue = activeFilterColumn
    ? String(activeFilterColumn.getFilterValue() ?? "")
    : search;
  const updateFilter = (next: string) => {
    if (activeFilterColumn) {
      model.setColumnFilter(activeFilterColumn.id, next);
    } else {
      setSearch(next);
    }
  };
  const handleColumnFilterShortcut = (input: string) => {
    const columnId = columnIds[Number(input) - 1];
    if (columnId && table.getColumn(columnId)?.getCanFilter()) {
      setFilterColumnId(columnId);
      setMode("insert");
      setDateFocused(false);
      setLastKey("");
    }
  };
  const handleInsertModeInput = (
    input: string,
    key: {
      escape?: boolean;
      return?: boolean;
      tab?: boolean;
      backspace?: boolean;
      delete?: boolean;
      ctrl?: boolean;
      meta?: boolean;
    },
  ) => {
    if (key.escape) {
      setMode("normal");
      setFilterColumnId(null);
    } else if (key.return || key.tab) {
      setMode("normal");
      setFilterColumnId(null);
    } else if (key.backspace || key.delete) {
      updateFilter(activeFilterValue.slice(0, -1));
    } else if (input && !key.ctrl && !key.meta) {
      updateFilter(activeFilterValue + input);
    }
  };
  const handleEscape = () => {
    if (dateFocused) {
      setDateFocused(false);
    } else if (!interactive) {
      tuiRouter.history.back();
    }
  };
  const handleTab = (shift: boolean | undefined) => {
    setDateFocused(!shift && Boolean(date));
  };
  const handleStartSearch = (input: string) => {
    setFilterColumnId(null);
    if (input === "/") {
      setSearch("");
    }
    setMode("insert");
    setLastKey("");
  };
  const handleSortShortcut = (input: string) => {
    const column = columnIds[Number(input) - 1];
    if (column) {
      model.toggleSorting(column);
    }
  };
  const handleMoveUp = () => {
    setDateFocused(false);
    setSelected((value) => {
      return Math.max(0, Math.min(value, rows.length - 1) - 1);
    });
    setLastKey("");
  };
  const handleMoveDown = () => {
    setDateFocused(false);
    setSelected((value) => {
      return Math.min(rows.length - 1, Math.min(value, rows.length - 1) + 1);
    });
    setLastKey("");
  };
  const handleMoveToLast = () => {
    setSelected(Math.max(0, rows.length - 1));
    setDateFocused(false);
    setLastKey("");
  };
  const handleMoveToFirst = () => {
    setSelected(0);
    setDateFocused(false);
    setLastKey("");
  };
  const handleGPrefix = () => {
    setLastKey("g");
  };
  const handleZPrefix = () => {
    setLastKey("");
  };
  const handleZ = () => {
    setLastKey("z");
  };
  const handleActivate = () => {
    if (rows[activeIndex]) {
      if (dateFocused && date) {
        setDateMode?.(dateMode === "relative" ? "utc" : "relative");
      } else {
        model.selectRow(rows[activeIndex].id);
        onSelect?.(rows[activeIndex].original);
      }
    }
  };
  const handleUnmatchedInput = () => {
    return setLastKey("");
  };
  useTuiInput((input, key) => {
    if (key.meta && /^[1-9]$/.test(input)) {
      handleColumnFilterShortcut(input);
      return;
    }
    if (mode === "insert") {
      handleInsertModeInput(input, key);
      return;
    }
    switch (true) {
      case Boolean(key.escape):
        handleEscape();
        break;
      case Boolean(key.tab):
        handleTab(key.shift);
        break;
      case input === "i" || input === "/":
        handleStartSearch(input);
        break;
      case interactive && !key.ctrl && /^[1-3]$/.test(input):
        handleSortShortcut(input);
        break;
      case Boolean(key.upArrow) || input === "k":
        handleMoveUp();
        break;
      case Boolean(key.downArrow) || input === "j":
        handleMoveDown();
        break;
      case input === "G":
        handleMoveToLast();
        break;
      case input === "g" && lastKey === "g":
        handleMoveToFirst();
        break;
      case input === "g":
        handleGPrefix();
        break;
      case input === "z" && lastKey === "z":
        handleZPrefix();
        break;
      case input === "z":
        handleZ();
        break;
      case Boolean(key.return):
        handleActivate();
        break;
      default:
        handleUnmatchedInput();
    }
  });
  return (
    <Box flexDirection="column" width="100%">
      <Text dimColor>
        {mode === "insert"
          ? activeFilterColumn
            ? `Filter ${String(activeFilterColumn.columnDef.header)}: `
            : "Search: "
          : ""}
        {activeFilterValue && <Text color="yellow">{activeFilterValue}</Text>}
        {interactive && mode !== "insert" && (
          <Text dimColor> / search · Alt+1/2/3 filter · 1/2/3 sort</Text>
        )}
        {mode === "insert" && <Text color="yellow">▏</Text>}
      </Text>
      {mode !== "insert" && table.state.columnFilters.length > 0 && (
        <Text dimColor>
          {table.state.columnFilters
            .map((filter) => {
              return `${String(table.getColumn(filter.id)?.columnDef.header ?? filter.id)}: ${String(filter.value)}`;
            })
            .join(" · ")}
        </Text>
      )}
      <Text bold color="cyan">
        {columns.map(({ id, width, column }, index) => {
          const label = String(column.columnDef.header ?? id);
          const sort = column.getIsSorted();
          const indicator = sort === "asc" ? " ↑" : sort === "desc" ? " ↓" : "";
          const filterHint = column.getIsFiltered() ? " *" : "";
          return (
            <Text key={id}>
              {cellText(label + indicator + filterHint, width)}
              {index < columns.length - 1 ? " ".repeat(gap) : ""}
            </Text>
          );
        })}
      </Text>
      {rows.length ? (
        rows.slice(start, start + pageSize).map((row, offset) => {
          const isSelected = start + offset === activeIndex && selected >= 0;
          return (
            <Box key={row.id} width={width} backgroundColor={isSelected ? "cyan" : undefined}>
              {columns.map(({ id, width }, index) => {
                return (
                  <Box key={id}>
                    {id === "publishedAt" && row.original.publishedAt ? (
                      <Box width={width} overflow="hidden">
                        <CycleableDate
                          value={row.original.publishedAt}
                          showHint={false}
                          managedFocus
                          focused={isSelected && dateFocused}
                        />
                      </Box>
                    ) : (
                      <Text color={isSelected ? "black" : undefined}>
                        {cellText(String(row.getValue(id) ?? ""), width)}
                      </Text>
                    )}
                    {index < columns.length - 1 && <Text>{" ".repeat(gap)}</Text>}
                  </Box>
                );
              })}
            </Box>
          );
        })
      ) : (
        <Text dimColor>
          {search || table.state.columnFilters.length ? "No matching records." : "No records yet."}
        </Text>
      )}
      {rows.length > pageSize && (
        <Text dimColor>
          {start + 1}–{Math.min(start + pageSize, rows.length)} of {rows.length}
        </Text>
      )}
    </Box>
  );
};
