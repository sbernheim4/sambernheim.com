import { createFileRoute } from "@tanstack/react-router";
import { TaskCreatePage } from "@features/Tasks/components/TaskForms";

const TaskCreateRoute = () => {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <TaskCreatePage
      activeTab={tab === "profile" ? "profile" : "entity"}
      onActiveTabChange={(nextTab) => {
        return navigate({ search: { tab: nextTab } });
      }}
    />
  );
};

export const Route = createFileRoute("/form-demo/tasks/create")({
  component: TaskCreateRoute,
});
