import { createFileRoute } from "@tanstack/react-router";
import { TaskPage } from "../features/workspace/components/WorkspacePages";
const Page = () => {
  const { taskId } = Route.useParams();
  return <TaskPage key={taskId} id={taskId} />;
};
export const Route = createFileRoute("/tasks/$taskId")({ ssr: false, component: Page });
