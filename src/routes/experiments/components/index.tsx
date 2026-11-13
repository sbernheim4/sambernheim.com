import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/experiments/components/")({
  beforeLoad: () => {
    throw redirect({
      to: "/experiments/components/$component",
      params: { component: "text" },
    });
  },
});
