import { queryOptions } from "@tanstack/react-query";
import { fetchBootstrap } from "./api";
export const workspaceKey = () => {
  return ["forms-example"] as const;
};
export const bootstrapKey = () => {
  return [...workspaceKey(), "bootstrap"] as const;
};
export const bootstrapQueryOptions = () => {
  return queryOptions({ queryKey: bootstrapKey(), queryFn: fetchBootstrap, staleTime: 5000 });
};
