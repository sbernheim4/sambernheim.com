import { bootstrapKey, workspaceKey } from "./queryOptions";
import { tasksKey } from "./tasks/queryOptions";
import { projectsKey } from "./projects/queryOptions";
import { organizationsKey } from "./organizations/queryOptions";
import type { QueryClient } from "@tanstack/react-query";
import type { BootstrapData } from "./types";
export const clearWorkspace = async (
  queryClient: QueryClient,
  request: () => Promise<BootstrapData>,
) => {
  const data = await request();
  await queryClient.cancelQueries({ queryKey: workspaceKey() });
  // Reset active observers too: removing their cache entry alone leaves their
  // last rendered result visible until a later observer update.
  await queryClient.resetQueries({ queryKey: workspaceKey() });
  queryClient.removeQueries({ queryKey: workspaceKey(), type: "inactive" });
  queryClient.setQueryData(bootstrapKey(), data);
  queryClient.setQueryData(organizationsKey(), data.organizations);
  queryClient.setQueryData(projectsKey(), data.projects);
  queryClient.setQueryData(tasksKey(), data.tasks);
  return true;
};
