import { useThreads } from "../hooks/useThreads";
import { useWorkspaceRenderer } from "@features/Workspace/components/renderer";

export const ThreadList = () => {
  const { EntityList } = useWorkspaceRenderer();
  const query = useThreads();
  const data = (query.data ?? []).map((item) => {
    return {
      id: item.id,
      name: item.name,
      status: item.status,
      summary: item.entryPoint,
      href: `/experiments/workspace/threads/${item.id}`,
    };
  });
  return (
    <EntityList
      title="Threads"
      createHref="/experiments/workspace/threads/create"
      createLabel="Create thread"
      data={data}
      loading={query.isPending}
    />
  );
};
