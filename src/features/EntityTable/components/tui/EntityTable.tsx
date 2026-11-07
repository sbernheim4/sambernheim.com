import { Box, Text } from "ink";
import type { EntityTableRecord } from "../../model";
import { useEntityTable } from "../../model";

export function EntityTable({ data }: { data: EntityTableRecord[] }) {
  const table = useEntityTable(data);
  const rows = table.getRowModel().rows;
  return <Box flexDirection="column">
    <Text bold color="cyan">NAME                 STATUS       DETAILS</Text>
    {rows.length ? rows.map(row => <Text key={row.id}>
      <Text color="green">{row.original.name.padEnd(20).slice(0, 20)}</Text>  <Text color="yellow">{row.original.status.padEnd(11).slice(0, 11)}</Text> {row.original.summary}
    </Text>) : <Text dimColor>No records yet.</Text>}
  </Box>;
}
