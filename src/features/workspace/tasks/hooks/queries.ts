import { useQuery } from "@tanstack/react-query";
import * as api from "../../api";
import { reconcileWorkspaceRead } from "../../cache";
import { workspaceKeys as keys } from "../../queries";
import { useResourceQuery } from "../../hooks/useResourceQuery";
export const useTasks = () =>
  useQuery({
    structuralSharing: reconcileWorkspaceRead,
    queryKey: keys.tasks.list(),
    queryFn: api.fetchTasks,
  });

export const useProjectTasks = (id: string) =>
  useQuery({
    structuralSharing: reconcileWorkspaceRead,
    queryKey: keys.tasks.forProject(id),
    queryFn: () => api.fetchProjectTasks(id),
    enabled: !!id,
  });

export const useTask = (id: string) =>
  useResourceQuery(keys.tasks.detail(id), () => api.fetchTask(id), !!id);
