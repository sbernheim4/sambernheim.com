import { useCommandAction } from "../../model";
import { useTuiWorkspaceNavigation } from "@features/Workspace/components/tui/Primitives/Navigation";
import type { TuiRoute } from "@features/Site/tuiRouter";
import { navigationDestinations } from "@features/Site/navigationDestinations";

const DestinationCommand = ({ label, path, id }: (typeof navigationDestinations)[number]) => {
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

export const NavigationCommands = ({ route }: { route: TuiRoute }) => {
  return (
    <>
      {navigationDestinations.map((item) => {
        return <DestinationCommand key={item.id} {...item} />;
      })}
      <EditCommand route={route} />
    </>
  );
};
