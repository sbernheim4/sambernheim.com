import { createFileRoute } from "@tanstack/react-router";
import { TaskPage } from "../features/workspace/tasks/components/TaskPage";

const Page = () => {
  const { taskId } = Route.useParams();
  const { isEditing } = Route.useSearch();

  return <TaskPage key={taskId} id={taskId} isEditing={isEditing} />;
};

export const Route = createFileRoute("/tasks/$taskId")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { isEditing?: boolean } => {
    if (search.isEditing === true || search.isEditing === "true") {
      return { isEditing: true };
    }
    return {};
  },
  component: Page,
});
