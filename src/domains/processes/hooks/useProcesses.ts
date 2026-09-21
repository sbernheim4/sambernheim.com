import { useMutation, useQuery } from "@tanstack/react-query";
import { getProcess, listProcesses, updateProcess } from "../api";
export const processKeys = {
  all: ["processes"] as const,
  list: (taskId?: string) => {
    return [...processKeys.all, "list", taskId ?? "all"] as const;
  },
  detail: (id: string) => {
    return [...processKeys.all, "detail", id] as const;
  },
};
export const useProcesses = (taskId?: string) => {
  return useQuery({
    queryKey: processKeys.list(taskId),
    queryFn: () => {
      return listProcesses(taskId);
    },
  });
};
export const useProcess = (id: string) => {
  return useQuery({
    queryKey: processKeys.detail(id),
    queryFn: () => {
      return getProcess(id);
    },
    enabled: Boolean(id),
  });
};
export const useUpdateProcess = () => {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateProcess>[1] }) => {
      return updateProcess(id, input);
    },
  });
};
