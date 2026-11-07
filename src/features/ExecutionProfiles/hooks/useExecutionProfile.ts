import { useMutation, useQuery } from "@tanstack/react-query";
import { createExecutionProfile, getExecutionProfile, updateExecutionProfile } from "../api";
export const profileKeys = {
  all: ["execution-profiles"] as const,
  detail: (id: string) => {
    return [...profileKeys.all, "detail", id] as const;
  },
};
export const useExecutionProfile = (id: string) => {
  return useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: () => {
      return getExecutionProfile(id);
    },
    enabled: Boolean(id),
  });
};
export const useUpdateExecutionProfile = () => {
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof updateExecutionProfile>[1];
    }) => {
      return updateExecutionProfile(id, input);
    },
  });
};

export const useCreateExecutionProfile = () => {
  return useMutation({
    mutationFn: (input: Parameters<typeof createExecutionProfile>[0]) => {
      return createExecutionProfile(input);
    },
  });
};
