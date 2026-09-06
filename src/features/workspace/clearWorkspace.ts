import type { QueryClient } from "@tanstack/react-query";
import type { BootstrapData } from "./types";
import { bootstrapKey, workspaceKeys } from "./queries.ts";

export async function clearWorkspace(
  queryClient: QueryClient,
  request: () => Promise<BootstrapData>,
) {
  const data = await request();
  await queryClient.cancelQueries({ queryKey: workspaceKeys.all });
  // Reset active observers too: removing their cache entry alone leaves their
  // last rendered result visible until a later observer update.
  await queryClient.resetQueries({ queryKey: workspaceKeys.all });
  queryClient.removeQueries({ queryKey: workspaceKeys.all, type: "inactive" });
  queryClient.setQueryData(bootstrapKey, data);
  queryClient.setQueryData(workspaceKeys.organizations.list(), data.organizations);
  queryClient.setQueryData(workspaceKeys.projects.list(), data.projects);
  queryClient.setQueryData(workspaceKeys.tasks.list(), data.tasks);
  return true;
}
