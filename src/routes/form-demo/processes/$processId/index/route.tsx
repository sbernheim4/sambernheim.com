import { createFileRoute } from "@tanstack/react-router";
import { ProcessDetailPage } from "../../../../processes/-ProcessPages";

export const Route = createFileRoute("/form-demo/processes/$processId/")({
  component: () => {
    return <ProcessDetailPage id={Route.useParams().processId} />;
  },
});
