import { Outlet, createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/form-demo/threads/$threadId")({
  component: Outlet,
});
