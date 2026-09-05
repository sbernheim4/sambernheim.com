import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/forms")({
  ssr: false,
  component: FormsLayout,
});

function FormsLayout() {
  return <Outlet />;
}
