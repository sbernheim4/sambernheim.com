import { Box, Text } from "ink";
import { TuiMenu, type TuiMenuItem } from "@features/Site/components/tui/TuiMenu";

const destinations: TuiMenuItem[] = [
  { label: "Tasks", path: "/form-demo/tasks", description: "List and create tasks" },
  { label: "Processes", path: "/form-demo/processes", description: "List and create processes" },
  { label: "Threads", path: "/form-demo/threads", description: "List and create threads" },
];

export const FormDemoHome = () => {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="cyan">
        Form Demo
      </Text>
      <Text dimColor>Explore the same workspace from the terminal.</Text>
      <TuiMenu items={destinations} />
    </Box>
  );
};
