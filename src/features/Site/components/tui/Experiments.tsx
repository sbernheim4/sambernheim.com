import { Box, Text } from "ink";
import {
  CommandPaletteExperiment,
  DatesExperiment,
  FormsExperiment,
  GlobalLoaderExperiment,
  TrackableExperiment,
  ViewsExperiment,
} from "./ExperimentDemos";
import { TuiMenu, type TuiMenuItem } from "./TuiMenu";

export const experiments: readonly TuiMenuItem[] = [
  {
    label: "Trackable",
    path: "/experiments/trackable",
    description: "Map values, merge events, and execute the chain",
  },
  {
    label: "Terminal",
    path: "/experiments/terminal",
    description: "One app rendered for web and terminal",
  },
  {
    label: "Python editor",
    path: "/experiments/python-editor",
    description: "A browser editor with a client-side language server",
  },
  {
    label: "Workspace application",
    path: "/experiments/workspace",
    description: "Forms, loader, palette, dates, and views together",
  },
  {
    label: "Multiple forms",
    path: "/experiments/forms",
    description: "Validation, dependent saves, cache updates, and undo",
  },
  {
    label: "Display options",
    path: "/experiments/views",
    description: "Tabs, sidebar, or full-page details",
  },
  {
    label: "Cycleable dates",
    path: "/experiments/dates",
    description: "Switch between UTC, local, and relative formats",
  },
  {
    label: "Global loader",
    path: "/experiments/global-loader",
    description: "A site-wide indicator for query activity",
  },
  {
    label: "Command palette",
    path: "/experiments/command-palette",
    description: "Actions register as the interface renders",
  },
];

export const Experiments = () => {
  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        Experiments
      </Text>
      <Text>Tools and ideas, working together in this site.</Text>
      <TuiMenu items={experiments} />
    </Box>
  );
};

export const ExperimentDetail = ({ slug }: { slug: string }) => {
  const experiment = experiments.find((item) => {
    return item.path.endsWith(`/${slug}`);
  });
  if (slug === "dates") {
    return <DatesExperiment />;
  }
  if (slug === "views") {
    return <ViewsExperiment />;
  }
  if (slug === "forms") {
    return <FormsExperiment />;
  }
  if (slug === "global-loader") {
    return <GlobalLoaderExperiment />;
  }
  if (slug === "command-palette") {
    return <CommandPaletteExperiment />;
  }
  if (slug === "trackable") {
    return <TrackableExperiment />;
  }
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold color="cyan">
        {experiment?.label ?? "Experiment"}
      </Text>
      <Text>
        {slug === "terminal"
          ? "You’re already using the terminal version of the site. It shares the app’s hooks, business logic, and TanStack libraries."
          : (experiment?.description ?? "Explore this experiment on the website.")}
      </Text>
      {slug === "python-editor" && (
        <Text dimColor>The Monaco editor and browser language server run in the web version.</Text>
      )}
      <TuiMenu
        items={[
          {
            label: "All experiments",
            path: "/experiments",
            description: "Back to the experiments list",
          },
        ]}
      />
    </Box>
  );
};
