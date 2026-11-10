import { createFileRoute } from "@tanstack/react-router";
import { ProcessList } from "@features/Processes/components/ProcessList";

export const Route = createFileRoute("/experiments/workspace/processes/")({
  component: ProcessList,
});
