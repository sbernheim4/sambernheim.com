import { Outlet, createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/experiments/workspace/processes/$processId")({
  component: Outlet,
});
