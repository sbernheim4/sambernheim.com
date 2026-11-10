import { Outlet, createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/experiments/workspace/tasks/$taskId")({
  component: Outlet,
});
