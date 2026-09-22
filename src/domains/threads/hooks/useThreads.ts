import { useMutation, useQuery } from "@tanstack/react-query";
import { createThread, getThread, listThreads, updateThread } from "../api";
export const threadKeys = {
  all: ["threads"] as const,
  list: (processId?: string) => {
    return [...threadKeys.all, "list", processId ?? "all"] as const;
  },
  detail: (id: string) => {
    return [...threadKeys.all, "detail", id] as const;
  },
};
export const useThreads = (processId?: string) => {
  return useQuery({
    queryKey: threadKeys.list(processId),
    queryFn: () => {
      return listThreads(processId);
    },
  });
};
export const useThread = (id: string) => {
  return useQuery({
    queryKey: threadKeys.detail(id),
    queryFn: () => {
      return getThread(id);
    },
    enabled: Boolean(id),
  });
};
export const useUpdateThread = () => {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateThread>[1] }) => {
      return updateThread(id, input);
    },
  });
};

export const useCreateThread = () => {
  return useMutation({
    mutationFn: (input: Parameters<typeof createThread>[0]) => {
      return createThread(input);
    },
  });
};
