import { Outlet, createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/form-demo/processes/$processId")({
  component: Outlet,
});
