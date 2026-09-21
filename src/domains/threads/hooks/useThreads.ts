import { useMutation, useQuery } from "@tanstack/react-query";
import { getThread, listThreads, updateThread } from "../api";
export const threadKeys = {
  all: ["threads"] as const,
  list: (processId?: string) => [...threadKeys.all, "list", processId ?? "all"] as const,
  detail: (id: string) => [...threadKeys.all, "detail", id] as const,
};
export const useThreads = (processId?: string) =>
  useQuery({ queryKey: threadKeys.list(processId), queryFn: () => listThreads(processId) });
export const useThread = (id: string) =>
  useQuery({ queryKey: threadKeys.detail(id), queryFn: () => getThread(id), enabled: Boolean(id) });
export const useUpdateThread = () => {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateThread>[1] }) =>
      updateThread(id, input),
  });
};
