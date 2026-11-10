import { useCommandAction } from "../../commands";
import { useTuiWorkspaceNavigation } from "@features/Workspace/components/tui/Primitives/Navigation";
import type { TuiRoute } from "@features/Site/tuiRouter";

const destinations = [
  { id: "home", label: "Home", path: "/" },
  { id: "blog", label: "Blog", path: "/blog" },
  { id: "experiments", label: "Experiments", path: "/experiments" },
  { id: "workspace", label: "Workspace", path: "/experiments/workspace" },
  { id: "tasks", label: "Tasks", path: "/experiments/workspace/tasks" },
  { id: "processes", label: "Processes", path: "/experiments/workspace/processes" },
  { id: "threads", label: "Threads", path: "/experiments/workspace/threads" },
  { id: "create-task", label: "Create task", path: "/experiments/workspace/tasks/create" },
  {
    id: "create-process",
    label: "Create process",
    path: "/experiments/workspace/processes/create",
  },
  { id: "create-thread", label: "Create thread", path: "/experiments/workspace/threads/create" },
] as const;

const DestinationCommand = ({ label, path, id }: (typeof destinations)[number]) => {
  const navigate = useTuiWorkspaceNavigation();
  useCommandAction({
    id: `navigation:${id}`,
    label,
    group: "Navigation",
    keywords: [path],
    execute: () => {
      navigate(path);
    },
  });
  return null;
};

const EditCommand = ({ route }: { route: TuiRoute }) => {
  const navigate = useTuiWorkspaceNavigation();
  useCommandAction(
    route.page === "entity-detail"
      ? {
          id: "entity:edit",
          label: `Edit ${route.entity.slice(0, -1)}`,
          group: "Actions",
          execute: () => {
            navigate(`/experiments/workspace/${route.entity}/${route.id}/edit`);
          },
        }
      : null,
  );
  return null;
};

export const TuiNavigationCommands = ({ route }: { route: TuiRoute }) => {
  return (
    <>
      {destinations.map((item) => {
        return <DestinationCommand key={item.id} {...item} />;
      })}
      <EditCommand route={route} />
    </>
  );
};
