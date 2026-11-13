import { useNavigate } from "@tanstack/react-router";
import { useCommandAction } from "@features/CommandPalette/model";
import { navigationDestinations } from "@features/Site/navigationDestinations";

const DestinationAction = ({ id, label, path }: (typeof navigationDestinations)[number]) => {
  const navigate = useNavigate();
  useCommandAction({
    id: `navigation:${id}`,
    label,
    group: "Navigation",
    keywords: [path],
    execute: () => {
      void navigate({ to: path as "/" });
    },
  });
  return null;
};

export const SiteNavigationActions = () => {
  return (
    <>
      {navigationDestinations.map((destination) => {
        return <DestinationAction key={destination.id} {...destination} />;
      })}
    </>
  );
};
