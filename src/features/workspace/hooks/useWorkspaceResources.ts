import { useQuery } from "@tanstack/react-query";
import { bootstrapQueryOptions } from "../queryOptions";

export const useWorkspaceResources = () => {
  return useQuery(bootstrapQueryOptions());
};
