import { useMutation, useQuery } from "@tanstack/react-query";
import { getTask, listTasks, updateTask } from "../api";
export const taskKeys = {
  all: ["tasks"] as const,
  list: () => {
    return [...taskKeys.all, "list"] as const;
  },
  detail: (id: string) => {
    return [...taskKeys.all, "detail", id] as const;
  },
};
export const useTasks = () => {
  return useQuery({ queryKey: taskKeys.list(), queryFn: listTasks });
};
export const useTask = (id: string) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => {
      return getTask(id);
    },
    enabled: Boolean(id),
  });
};
export const useUpdateTask = () => {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateTask>[1] }) => {
      return updateTask(id, input);
    },
  });
};
