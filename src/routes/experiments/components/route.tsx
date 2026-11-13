import { createFileRoute } from "@tanstack/react-router";
import { ComponentLibrary } from "./ComponentLibrary/ComponentLibrary";

export const Route = createFileRoute("/experiments/components")({
  head: () => {
    return {
      meta: [
        { title: "One component, two renderers — Samuel Bernheim" },
        {
          name: "description",
          content: "Interactive web and terminal components with shared state, logic, and models.",
        },
      ],
    };
  },
  component: ComponentLibrary,
});
