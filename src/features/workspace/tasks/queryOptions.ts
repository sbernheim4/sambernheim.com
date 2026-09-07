import { queryOptions } from "@tanstack/react-query";
import * as api from "../api";
import { workspaceKey } from "../queryOptions";
export const taskListsKey = () => {
  return [...workspaceKey(), "tasks", "list"] as const;
};
export const tasksKey = () => {
  return [...taskListsKey(), "all"] as const;
};
export const tasksQueryOptions = () => {
  return queryOptions({ queryKey: tasksKey(), queryFn: api.fetchTasks });
};
export const projectTasksKey = (id: string) => {
  return [...taskListsKey(), "project", id] as const;
};
export const projectTasksQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: projectTasksKey(id),
    queryFn: () => {
      return api.fetchProjectTasks(id);
    },
    enabled: !!id,
  });
};
export const taskKey = (id: string) => {
  return [...workspaceKey(), "tasks", "detail", id] as const;
};
export const taskQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: taskKey(id),
    queryFn: () => {
      return api.fetchTask(id);
    },
    enabled: !!id,
    retry: (attempt, error) => {
      return !(error instanceof api.ApiError && error.status < 500) && attempt < 1;
    },
  });
};
