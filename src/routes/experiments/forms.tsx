import { createFileRoute } from "@tanstack/react-router";
import { FormsPlayground } from "@/features/Playground/FormsPlayground";

export const Route = createFileRoute("/experiments/forms")({
  component: FormsPlayground,
  head: () => {
    return { meta: [{ title: "Forms playground — Samuel Bernheim" }] };
  },
});
