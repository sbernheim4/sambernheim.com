import { createFileRoute } from "@tanstack/react-router";
import { ThreadDetail } from "@features/Threads/components/ThreadDetail";

export const Route = createFileRoute("/experiments/workspace/threads/$threadId/")({
  component: () => {
    return <ThreadDetail id={Route.useParams().threadId} />;
  },
});
