import { Box, Text } from "ink";
import { TuiMenu, type TuiMenuItem } from "@features/Site/components/tui/TuiMenu";

const destinations: TuiMenuItem[] = [
  { label: "Tasks", path: "/experiments/workspace/tasks", description: "List and create tasks" },
  {
    label: "Processes",
    path: "/experiments/workspace/processes",
    description: "List and create processes",
  },
  {
    label: "Threads",
    path: "/experiments/workspace/threads",
    description: "List and create threads",
  },
];

export const WorkspaceHome = () => {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="cyan">
        Workspace
      </Text>
      <Text dimColor>Explore the same workspace from the terminal.</Text>
      <TuiMenu items={destinations} />
    </Box>
  );
};
