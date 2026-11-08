import { Box, Text, useInput } from "ink";
import { EntityTable } from "@features/EntityTable/components/tui/EntityTable";
import { useTuiWorkspaceNavigation } from "../Primitives/Navigation";
import type { WorkspaceRenderer } from "../../renderer";
export const EntityList: WorkspaceRenderer["EntityList"] = ({
  title,
  createHref,
  createLabel,
  data,
  loading,
}) => {
  const navigate = useTuiWorkspaceNavigation();
  useInput((input) => {
    if (input === "c") {
      navigate(createHref);
    }
  });
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>{title.toUpperCase()}</Text>
      <Text dimColor>List · c {createLabel}</Text>
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
