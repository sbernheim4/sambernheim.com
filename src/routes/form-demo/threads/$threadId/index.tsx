import { createFileRoute } from "@tanstack/react-router";
import { ThreadDetailPage } from "../../../../pages/threads/ThreadPages";

export const Route = createFileRoute("/form-demo/threads/$threadId/")({
  component: () => {
    return <ThreadDetailPage id={Route.useParams().threadId} />;
  },
});
