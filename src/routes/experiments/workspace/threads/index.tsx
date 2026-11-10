import { createFileRoute } from "@tanstack/react-router";
import { ThreadList } from "@features/Threads/components/ThreadList";

export const Route = createFileRoute("/experiments/workspace/threads/")({
  component: ThreadList,
});
