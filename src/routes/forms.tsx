import { createFileRoute, Outlet } from "@tanstack/react-router";
const FormsLayout = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/forms")({
  ssr: false,
  component: FormsLayout,
});
