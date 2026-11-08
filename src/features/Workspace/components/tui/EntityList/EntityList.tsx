import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { useAutomaticCommandAction } from "@features/Commands/commands";
import { Box, Text } from "ink";
import { EntityTable } from "@features/EntityTable/components/tui/EntityTable";
import { useTuiWorkspaceNavigation } from "../Primitives/Navigation";
import { useTuiInputMode } from "../Primitives/InputMode";
import type { WorkspaceRenderer } from "../../renderer";
export const EntityList: WorkspaceRenderer["EntityList"] = ({
  title,
  createHref,
  createLabel,
  data,
  loading,
}) => {
  const navigate = useTuiWorkspaceNavigation();
  const { mode } = useTuiInputMode();
  useAutomaticCommandAction({
    kind: "button",
    label: createLabel,
    command: { group: "Actions" },
    execute: () => {
      navigate(createHref);
    },
  });
  useTuiInput((input) => {
    if (mode === "normal" && input === "c") {
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
