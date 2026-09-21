import { createFileRoute } from "@tanstack/react-router";
import { ThreadDetailPage } from "../../ThreadPages";
export const Route = createFileRoute("/threads/$threadId/")({
  component: () => <ThreadDetailPage id={Route.useParams().threadId} />,
});
