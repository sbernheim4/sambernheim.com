import { useProcesses } from "../hooks/useProcesses";
import { useWorkspaceRenderer } from "@features/Workspace/components/renderer";

export const ProcessList = () => {
  const { EntityList } = useWorkspaceRenderer();
  const query = useProcesses();
  const data = (query.data ?? []).map((item) => {
    return {
      id: item.id,
      name: item.name,
      status: item.status,
      summary: item.command,
      href: `/experiments/workspace/processes/${item.id}`,
    };
  });
  return (
    <EntityList
      title="Processes"
      createHref="/experiments/workspace/processes/create"
      createLabel="Create process"
      data={data}
      loading={query.isPending}
    />
  );
};
