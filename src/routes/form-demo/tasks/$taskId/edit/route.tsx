import { createFileRoute } from "@tanstack/react-router";
import { TaskEditPage } from "../../../../tasks/-TaskPages";

const TaskEditRoute = () => {
  const { taskId } = Route.useParams();

  const { tab } = Route.useSearch();

  const navigate = Route.useNavigate();

  return (
    <TaskEditPage
      id={taskId}
      activeTab={tab === "profile" ? "profile" : "entity"}
      onActiveTabChange={(nextTab) => {
        return navigate({ search: { tab: nextTab } });
      }}
    />
  );
};
export const Route = createFileRoute("/form-demo/tasks/$taskId/edit")({ component: TaskEditRoute });
