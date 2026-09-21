import { createFileRoute } from "@tanstack/react-router";
import { TaskDetailPage } from "../../TaskPages";
export const Route = createFileRoute("/tasks/$taskId/")({
  component: () => <TaskDetailPage id={Route.useParams().taskId} />,
});
