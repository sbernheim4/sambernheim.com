import { createFileRoute } from "@tanstack/react-router";
import { TaskDetail } from "@features/Tasks/components/TaskDetail";

export const Route = createFileRoute("/form-demo/tasks/$taskId/")({
  component: () => {
    return <TaskDetail id={Route.useParams().taskId} />;
  },
});
