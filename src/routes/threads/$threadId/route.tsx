import { Outlet, createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/threads/$threadId")({
  component: Outlet,
});
