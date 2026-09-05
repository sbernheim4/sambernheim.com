import { createFileRoute } from "@tanstack/react-router";
import { TaskPage } from "../features/workspace/components/WorkspacePages";

export const Route = createFileRoute("/tasks/$taskId")({ ssr: false, component: Page });

function Page() {
  const { taskId } = Route.useParams();
  return <TaskPage key={taskId} id={taskId} />;
}
