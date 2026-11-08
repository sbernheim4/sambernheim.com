import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { TuiCycleableDate } from "@features/Dates/components/tui/CycleableDate";
import { Box, Text, useStdout } from "ink";
import { useMemo, useState } from "react";
import type { EntityTableRecord } from "../../model";
import { useEntityTable } from "../../model";
import { useTuiInputMode } from "@features/Workspace/components/tui/Primitives/InputMode";
import { useCycleableDateTimeMode } from "@features/Dates/hooks/useCycleableDateTimeMode";
import { tuiRouter } from "@features/Site/tuiRouter";

export const EntityTable = ({
  data,
  onSelect,
  variant = "entities",
}: {
  data: EntityTableRecord[];
  onSelect?: (record: EntityTableRecord) => void;
  variant?: "entities" | "articles";
}) => {
  const [selected, setSelected] = useState(0);
  const [lastKey, setLastKey] = useState("");
  const [search, setSearch] = useState("");
  const [dateFocused, setDateFocused] = useState(false);
  const { mode: dateMode, setMode: setDateMode } = useCycleableDateTimeMode();
  const { mode, setMode } = useTuiInputMode();
  const { stdout } = useStdout();
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return data;
    }
    return data.filter((record) => {
      return `${record.name} ${record.status} ${record.summary}`.toLowerCase().includes(query);
    });
  }, [data, search]);
  const hasDates = filtered.some((record) => {
    return Boolean(record.publishedAt);
  });
  const table = useEntityTable(filtered, hasDates);
  const rows = table.getRowModel().rows;
  const activeIndex = Math.max(0, Math.min(selected, rows.length - 1));
  const date = rows[activeIndex]?.original.publishedAt;
  const pageSize = 12;
  const width = Math.max(60, (stdout.columns ?? 100) - 4);
  const dateWidth = hasDates ? 19 : 0;
  const contentWidth = width - dateWidth;
  const nameWidth = Math.max(20, Math.floor(contentWidth * (variant === "articles" ? 0.35 : 0.28)));
  const statusWidth = variant === "articles" ? 0 : Math.max(11, Math.floor(contentWidth * 0.16));
  const summaryWidth = Math.max(12, contentWidth - nameWidth - statusWidth - 6);
  const start = Math.max(
    0,
    Math.min(activeIndex - Math.floor(pageSize / 2), rows.length - pageSize),
  );
  useTuiInput((input, key) => {
    if (mode === "insert") {
      if (key.escape) {
        setMode("normal");
        return;
      }
      if (key.return || key.tab) {
        setMode("normal");
      } else if (key.backspace || key.delete) {
        setSearch((value) => {
          return value.slice(0, -1);
        });
        setSelected(0);
      } else if (input && !key.ctrl && !key.meta && !key.escape) {
        setSearch((value) => {
          return value + input;
        });
        setSelected(0);
      }
      return;
    }
    if (key.escape) {
      if (dateFocused) {
        setDateFocused(false);
      } else {
        tuiRouter.history.back();
      }
      return;
    }
    if (key.tab) {
      setDateFocused(!key.shift && Boolean(date));
      return;
    }
    if (input === "i" || input === "/") {
      if (input === "/") {
        setSearch("");
        setSelected(0);
      }
      setMode("insert");
      setLastKey("");
      return;
    }
    if (key.meta && /^[1-9]$/.test(input)) {
      const column = (
        variant === "articles" ? ["name", "summary", "publishedAt"] : ["name", "status", "summary"]
      )[Number(input) - 1];
      if (column) {
        table.getColumn(column)?.toggleSorting();
      }
      return;
    }
    if (key.upArrow || input === "k") {
      setDateFocused(false);
      setSelected((value) => {
        return Math.max(0, Math.min(value, rows.length - 1) - 1);
      });
      setLastKey("");
    } else if (key.downArrow || input === "j") {
      setDateFocused(false);
      setSelected((value) => {
        return Math.min(rows.length - 1, Math.min(value, rows.length - 1) + 1);
      });
      setLastKey("");
    } else if (input === "G") {
      setSelected(Math.max(0, rows.length - 1));
      setDateFocused(false);
      setLastKey("");
    } else if (input === "g" && lastKey === "g") {
      setSelected(0);
      setDateFocused(false);
      setLastKey("");
    } else if (input === "g") {
      setLastKey("g");
    } else if (input === "z" && lastKey === "z") {
      setLastKey("");
    } else if (input === "z") {
      setLastKey("z");
    } else if (key.return && rows[activeIndex]) {
      if (dateFocused && date) {
        setDateMode?.(dateMode === "relative" ? "utc" : "relative");
      } else {
        onSelect?.(rows[activeIndex].original);
      }
    } else {
      setLastKey("");
    }
  });
  return (
    <Box flexDirection="column" width="100%">
      <Text dimColor>
        {mode === "insert" ? "Search: " : ""}
        {search && <Text color="yellow">{search}</Text>}
        {mode === "insert" && <Text color="yellow">▏</Text>}
      </Text>
      <Box width={width}>
        <Text bold color="cyan">
          {(variant === "articles" ? "TITLE  ⌥1" : "NAME  ⌥1").padEnd(nameWidth)}
          {variant === "entities" && "STATUS  ⌥2".padEnd(statusWidth)}
          {(variant === "articles" ? "DESCRIPTION  ⌥2" : "DETAILS  ⌥3").padEnd(summaryWidth)}
          {hasDates && "DATE"}
        </Text>
      </Box>
      {rows.length ? (
        rows.slice(start, start + pageSize).map((row, offset) => {
          const isSelected = start + offset === activeIndex;
          return (
            <Box
              key={row.id}
              flexDirection="row"
              width={width}
              backgroundColor={isSelected ? "cyan" : undefined}
            >
              <Text color={isSelected ? "black" : "green"}>
                {row.original.name.slice(0, nameWidth - 2).padEnd(nameWidth)}
              </Text>
              {variant === "entities" && (
                <Text color={isSelected ? "black" : "yellow"}>
                  {row.original.status.slice(0, statusWidth - 2).padEnd(statusWidth)}
                </Text>
              )}
              <Text color={isSelected ? "black" : undefined}>
                {row.original.summary.slice(0, summaryWidth - 2).padEnd(summaryWidth)}
              </Text>
              {row.original.publishedAt && (
                <Box width={dateWidth}>
                  <TuiCycleableDate
                    value={row.original.publishedAt}
                    showHint={false}
                    managedFocus
                    focused={isSelected && dateFocused}
                    highlighted={false}
                  />
                </Box>
              )}
            </Box>
          );
        })
      ) : (
        <Text dimColor>{search ? "No matching records." : "No records yet."}</Text>
      )}
      {rows.length > pageSize && (
        <Text dimColor>
          {start + 1}–{Math.min(start + pageSize, rows.length)} of {rows.length}
        </Text>
      )}
    </Box>
  );
};
