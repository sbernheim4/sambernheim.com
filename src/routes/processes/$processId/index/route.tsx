import { createFileRoute } from "@tanstack/react-router";
import { ProcessDetailPage } from "../../ProcessPages";
export const Route = createFileRoute("/processes/$processId/")({
  component: () => <ProcessDetailPage id={Route.useParams().processId} />,
});
