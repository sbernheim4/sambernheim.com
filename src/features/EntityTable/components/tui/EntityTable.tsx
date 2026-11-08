import { Box, Text, useInput, useStdout } from "ink";
import { useState } from "react";
import type { EntityTableRecord } from "../../model";
import { useEntityTable } from "../../model";

export const EntityTable = ({
  data,
  onSelect,
}: {
  data: EntityTableRecord[];
  onSelect?: (record: EntityTableRecord) => void;
}) => {
  const [selected, setSelected] = useState(0);
  const [lastKey, setLastKey] = useState("");
  const { stdout } = useStdout();
  const table = useEntityTable(data);
  const rows = table.getRowModel().rows;
  const pageSize = 12;
  const width = Math.max(60, (stdout.columns ?? 100) - 4);
  const nameWidth = Math.max(20, Math.floor(width * 0.28));
  const statusWidth = Math.max(11, Math.floor(width * 0.16));
  const summaryWidth = Math.max(12, width - nameWidth - statusWidth - 6);
  const start = Math.max(0, Math.min(selected - Math.floor(pageSize / 2), rows.length - pageSize));
  useInput((input, key) => {
    if (key.upArrow || input === "k") {
      setSelected((value) => {
        return Math.max(0, value - 1);
      });
      setLastKey("");
    } else if (key.downArrow || input === "j") {
      setSelected((value) => {
        return Math.min(rows.length - 1, value + 1);
      });
      setLastKey("");
    } else if (input === "G") {
      setSelected(Math.max(0, rows.length - 1));
      setLastKey("");
    } else if (input === "g" && lastKey === "g") {
      setSelected(0);
      setLastKey("");
    } else if (input === "g") {
      setLastKey("g");
    } else if (input === "z" && lastKey === "z") {
      setLastKey("");
    } else if (input === "z") {
      setLastKey("z");
    } else if (key.return && rows[selected]) {
      onSelect?.(rows[selected].original);
    } else {
      setLastKey("");
    }
  });
  return (
    <Box flexDirection="column" width="100%">
      <Box width={width}>
        <Text bold color="cyan">
          {"NAME".padEnd(nameWidth)}
          {"STATUS".padEnd(statusWidth)}
          {"DETAILS".padEnd(summaryWidth)}
        </Text>
      </Box>
      {rows.length ? (
        rows.slice(start, start + pageSize).map((row, offset) => {
          return (
            <Text key={row.id} inverse={start + offset === selected}>
              <Text color="green">{row.original.name.padEnd(nameWidth).slice(0, nameWidth)}</Text>
              <Text color="yellow">
                {row.original.status.padEnd(statusWidth).slice(0, statusWidth)}
              </Text>
              {row.original.summary.slice(0, summaryWidth).padEnd(summaryWidth)}
            </Text>
          );
        })
      ) : (
        <Text dimColor>No records yet.</Text>
      )}
      {rows.length > pageSize && (
        <Text dimColor>
          {start + 1}–{Math.min(start + pageSize, rows.length)} of {rows.length} · j/k scroll · gg/G
          first/last · Enter open
        </Text>
      )}
    </Box>
  );
};
