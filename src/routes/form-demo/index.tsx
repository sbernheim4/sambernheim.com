import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/form-demo/")({
  beforeLoad: () => {
    throw redirect({ to: "/form-demo/tasks" });
  },
});
