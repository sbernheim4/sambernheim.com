import { Box, Text } from "ink";
import { TuiMenu, type TuiMenuItem } from "./TuiMenu";

const destinations: TuiMenuItem[] = [
  { label: "Blog", path: "/blog", description: "Articles on software and engineering" },
  {
    label: "Workspace",
    path: "/experiments/workspace",
    description: "Tasks, processes, and threads",
  },
];

export const Home = () => {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text dimColor>SOFTWARE ENGINEER · NEW YORK</Text>
      <Text bold color="cyan">
        Engineering thoughtful software systems.
      </Text>
      <Text>I work on products, tools, and ideas to make complex systems feel simpler.</Text>
      <Box marginTop={1} flexDirection="column">
        <Text bold>Hi, I’m Sam.</Text>
        <Text>I live in New York City and work at Balyasny Asset Management.</Text>
        <Text dimColor>Previously Wunderkind, Twitter, and Disney Streaming.</Text>
      </Box>
      <TuiMenu items={destinations} />
    </Box>
  );
};
