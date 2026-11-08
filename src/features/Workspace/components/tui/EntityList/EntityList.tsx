import { Box, Text } from "ink";
import { EntityTable } from "@features/EntityTable/components/tui/EntityTable";
import { useTuiWorkspaceNavigation } from "../Primitives/Navigation";
import type { WorkspaceRenderer } from "../../renderer";
export const EntityList: WorkspaceRenderer["EntityList"] = ({ title, data, loading }) => {
  const navigate = useTuiWorkspaceNavigation();
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>{title.toUpperCase()}</Text>
      {loading ? (
        <Text dimColor>Loading…</Text>
      ) : (
        <EntityTable
          data={data}
          onSelect={(row) => {
            return navigate(row.href);
          }}
        />
      )}
    </Box>
  );
};
