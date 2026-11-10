import { createFileRoute } from "@tanstack/react-router";
import { ProcessDetail } from "@features/Processes/components/ProcessDetail";

export const Route = createFileRoute("/experiments/workspace/processes/$processId/")({
  component: () => {
    return <ProcessDetail id={Route.useParams().processId} />;
  },
});
