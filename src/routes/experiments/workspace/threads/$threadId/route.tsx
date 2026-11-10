import { Outlet, createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/experiments/workspace/threads/$threadId")({
  component: Outlet,
});
