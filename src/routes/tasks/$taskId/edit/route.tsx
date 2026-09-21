import { createFileRoute } from "@tanstack/react-router";
import { TaskEditPage } from "../../TaskPages";
const TaskEditRoute = () => {
  const { taskId } = Route.useParams();

  const { tab } = Route.useSearch();

  const navigate = Route.useNavigate();

  return (
    <TaskEditPage
      id={taskId}
      activeTab={tab === "profile" ? "profile" : "entity"}
      onActiveTabChange={(nextTab) => navigate({ search: { tab: nextTab } })}
    />
  );
};
export const Route = createFileRoute("/tasks/$taskId/edit")({ component: TaskEditRoute });
