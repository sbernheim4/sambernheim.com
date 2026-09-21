import { useMutation, useQuery } from "@tanstack/react-query";
import { getProcess, listProcesses, updateProcess } from "../api";
export const processKeys = {
  all: ["processes"] as const,
  list: (taskId?: string) => [...processKeys.all, "list", taskId ?? "all"] as const,
  detail: (id: string) => [...processKeys.all, "detail", id] as const,
};
export const useProcesses = (taskId?: string) =>
  useQuery({ queryKey: processKeys.list(taskId), queryFn: () => listProcesses(taskId) });
export const useProcess = (id: string) =>
  useQuery({
    queryKey: processKeys.detail(id),
    queryFn: () => getProcess(id),
    enabled: Boolean(id),
  });
export const useUpdateProcess = () => {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateProcess>[1] }) =>
      updateProcess(id, input),
  });
};
