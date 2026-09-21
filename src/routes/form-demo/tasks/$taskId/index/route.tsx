import { createFileRoute } from "@tanstack/react-router";
import { TaskDetailPage } from "../../../../tasks/-TaskPages";

export const Route = createFileRoute("/form-demo/tasks/$taskId/")({
  component: () => {
    return <TaskDetailPage id={Route.useParams().taskId} />;
  },
});
