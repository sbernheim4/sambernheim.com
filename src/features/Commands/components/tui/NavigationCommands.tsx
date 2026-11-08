import { useCommandAction } from "../../commands";
import { useTuiWorkspaceNavigation } from "@features/Workspace/components/tui/Primitives/Navigation";
import type { TuiRoute } from "@features/Site/tuiRouter";

const destinations = [
  { id: "home", label: "Home", path: "/" },
  { id: "blog", label: "Blog", path: "/blog" },
  { id: "form-demo", label: "Form Demo", path: "/form-demo" },
  { id: "tasks", label: "Tasks", path: "/form-demo/tasks" },
  { id: "processes", label: "Processes", path: "/form-demo/processes" },
  { id: "threads", label: "Threads", path: "/form-demo/threads" },
  { id: "create-task", label: "Create task", path: "/form-demo/tasks/create" },
  { id: "create-process", label: "Create process", path: "/form-demo/processes/create" },
  { id: "create-thread", label: "Create thread", path: "/form-demo/threads/create" },
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
            navigate(`/form-demo/${route.entity}/${route.id}/edit`);
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
