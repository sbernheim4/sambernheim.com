import { Outlet, createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/form-demo/tasks/$taskId")({
  component: Outlet,
});
