import { useMutation, useQuery } from "@tanstack/react-query";
import { getExecutionProfile, updateExecutionProfile } from "../api";
export const profileKeys = {
  all: ["execution-profiles"] as const,
  detail: (id: string) => [...profileKeys.all, "detail", id] as const,
};
export const useExecutionProfile = (id: string) =>
  useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: () => getExecutionProfile(id),
    enabled: Boolean(id),
  });
export const useUpdateExecutionProfile = () => {
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof updateExecutionProfile>[1];
    }) => updateExecutionProfile(id, input),
  });
};
