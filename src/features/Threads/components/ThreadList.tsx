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
      href: `/form-demo/threads/${item.id}`,
    };
  });
  return (
    <EntityList
      title="Threads"
      createHref="/form-demo/threads/create"
      createLabel="Create thread"
      data={data}
      loading={query.isPending}
    />
  );
};
