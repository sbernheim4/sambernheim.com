import { createFileRoute } from "@tanstack/react-router";
import { TaskPage } from "../features/workspace/tasks/components/TaskPage";

const Page = () => {
  const { taskId } = Route.useParams();

  return <TaskPage key={taskId} id={taskId} />;
};

export const Route = createFileRoute("/tasks/$taskId")({ ssr: false, component: Page });
