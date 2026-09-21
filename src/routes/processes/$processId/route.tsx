import { Outlet, createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/processes/$processId")({
  component: Outlet,
});
