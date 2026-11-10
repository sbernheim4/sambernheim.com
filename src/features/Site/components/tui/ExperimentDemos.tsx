import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Text } from "ink";
import { TuiCycleableDateTime } from "@features/Dates/components/tui/CycleableDate";
import { useCommandAction } from "@features/Commands/commands";
import { useTrackableDemo } from "@features/Playground/useTrackableDemo";
import { DetailView } from "@features/Workspace/components/tui/DetailView/DetailView";
import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { TuiMenu } from "./TuiMenu";

const day = 24 * 60 * 60 * 1000;

export const DatesExperiment = () => {
  const now = Date.now();
  const examples = [
    { label: "Review pull request", date: new Date(now + day) },
    { label: "Recent job run", date: new Date(now - 3 * 60 * 60 * 1000) },
    { label: "Design review", date: new Date(now + 4 * day) },
  ];
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="cyan">
        Cycleable dates
      </Text>
      <Text>Focus a date and press Enter to cycle UTC, local, and relative formats.</Text>
      <Box flexDirection="column" marginTop={1}>
        {examples.map((example) => {
          return (
            <Box key={example.label} justifyContent="space-between" width="100%">
              <Text>{example.label}</Text>
              <TuiCycleableDateTime value={example.date} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export const ViewsExperiment = () => {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="cyan">
        Choose a detail layout
      </Text>
      <Text>Change the view, then switch sections. The same content works in each layout.</Text>
      <DetailView
        tabs={[
          {
            value: "overview",
            label: "Overview",
            children: (
              <Box flexDirection="column">
                <Text bold>Website refresh</Text>
                <Text>Project · In progress</Text>
                <Text>These details use the same view component as the web app.</Text>
              </Box>
            ),
          },
          {
            value: "activity",
            label: "Activity",
            children: (
              <Box flexDirection="column">
                <Text>Created the project</Text>
                <Text>Added a release task</Text>
                <Text>Assigned a review thread</Text>
              </Box>
            ),
          },
          {
            value: "notes",
            label: "Notes",
            children: <Text>Tabs, sidebar, or a full page—pick the layout that suits you.</Text>,
          },
        ]}
      />
    </Box>
  );
};

export const FormsExperiment = () => {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="cyan">
        Multiple forms, multiple endpoints
      </Text>
      <Text>
        The task editor composes an execution-profile form and a task form. The profile saves first,
        its ID flows into the task request, and the shared form editor handles validation, progress,
        cache updates, and undo.
      </Text>
      <TuiMenu
        items={[
          {
            label: "Open the composed task form",
            path: "/experiments/workspace/tasks/create",
            description: "Create a task and execution profile together",
          },
        ]}
      />
      <Text dimColor>Press Enter to open the form.</Text>
    </Box>
  );
};

export const GlobalLoaderExperiment = () => {
  const [refresh, setRefresh] = useState(0);
  const query = useQuery({
    queryKey: ["tui", "global-loader-experiment", refresh],
    queryFn: async () => {
      await new Promise((resolve) => {
        return setTimeout(resolve, 1800);
      });
      return new Date();
    },
  });
  useTuiInput((input) => {
    if (input === "r") {
      setRefresh((value) => {
        return value + 1;
      });
    }
  });
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="cyan">
        Global query loading indicator
      </Text>
      <Text>The shared loading indicator appears above while this query is fetching.</Text>
      <Text dimColor>
        {query.isSuccess
          ? `Last response: ${query.data.toLocaleTimeString()}`
          : "Waiting for the query…"}
      </Text>
      <Text dimColor>Press r to start another request and watch the site-wide indicator.</Text>
    </Box>
  );
};

export const CommandPaletteExperiment = () => {
  const [count, setCount] = useState(0);
  useCommandAction({
    id: "tui-experiment:counter-increment",
    label: "Increment experiment counter",
    group: "Actions",
    execute: () => {
      setCount((value) => {
        return value + 1;
      });
    },
  });
  useCommandAction({
    id: "tui-experiment:counter-reset",
    label: "Reset experiment counter",
    group: "Actions",
    execute: () => {
      setCount(0);
    },
  });
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="cyan">
        A command palette that builds itself
      </Text>
      <Text>Counter: {count}</Text>
      <Text>Open the TUI command palette with ff to find and run the counter actions.</Text>
      <Text dimColor>These actions register while this screen is rendered.</Text>
    </Box>
  );
};

export const TrackableExperiment = () => {
  const demo = useTrackableDemo();
  useTuiInput((input) => {
    if (input === "a") {
      demo.mapAddThree();
    } else if (input === "d") {
      demo.mapDouble();
    } else if (input === "m") {
      demo.flatMapAddFive({ source: "tui" });
    } else if (input === "n") {
      demo.flatMapAddRandom({ source: "tui" });
    } else if (input === "e") {
      demo.execute();
    } else if (input === "r") {
      demo.reset();
    }
  });
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="cyan">
        Using the Trackable Monad
      </Text>
      <Text>map changes the value; flatMap adds another Trackable’s events.</Text>
      <Text>Current value: {demo.current.getValue()}</Text>
      <Text>Queued events: {demo.current.getAnalyticsEvents().length}</Text>
      <Text>Chain: {demo.steps.join("")}</Text>
      <Box flexDirection="column" marginTop={1}>
        <Text>a map +3 · d map ×2</Text>
        <Text>m flatMap +5 · n flatMap +random</Text>
        <Text>e execute · r reset</Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        <Text>Returned value: {demo.lastResult ?? "—"}</Text>
        <Text>Events emitted: {demo.emitted.length}</Text>
        {demo.emitted.map((event, index) => {
          return <Text key={index}>• {JSON.stringify(event)}</Text>;
        })}
      </Box>
    </Box>
  );
};
