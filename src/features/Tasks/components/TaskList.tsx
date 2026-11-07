import { useTasks } from "../hooks/useTasks";
import { useWorkspaceRenderer } from "@features/Workspace/components/renderer";

export const TaskList = () => {
  const { EntityList } = useWorkspaceRenderer();
  const query = useTasks();
  const data = (query.data ?? []).map((item) => {
    return {
      id: item.id,
      name: item.name,
      status: item.status,
      summary: item.description,
      href: `/form-demo/tasks/${item.id}`,
    };
  });
  return (
    <EntityList
      title="Tasks"
      createHref="/form-demo/tasks/create"
      createLabel="Create task"
      data={data}
      loading={query.isPending}
    />
  );
};
