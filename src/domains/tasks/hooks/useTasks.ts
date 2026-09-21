import { useMutation, useQuery } from "@tanstack/react-query";
import { getTask, listTasks, updateTask } from "../api";
export const taskKeys = {
  all: ["tasks"] as const,
  list: () => [...taskKeys.all, "list"] as const,
  detail: (id: string) => [...taskKeys.all, "detail", id] as const,
};
export const useTasks = () => useQuery({ queryKey: taskKeys.list(), queryFn: listTasks });
export const useTask = (id: string) =>
  useQuery({ queryKey: taskKeys.detail(id), queryFn: () => getTask(id), enabled: Boolean(id) });
export const useUpdateTask = () => {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateTask>[1] }) =>
      updateTask(id, input),
  });
};
