import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import * as api from "../api";
import { reconcileWorkspaceRead } from "../cache";
import { readReplicaResource } from "../replicaRead";
export function useResourceQuery<T>(
  queryKey: QueryKey,
  request: () => Promise<T>,
  enabled: boolean,
) {
  const client = useQueryClient();
  return useQuery({
    queryKey,
    queryFn: () => readReplicaResource(client, queryKey, request),
    enabled,
    structuralSharing: reconcileWorkspaceRead,
    retry: (attempt, error) =>
      !(error instanceof api.ApiError && error.status < 500) && attempt < 1,
  });
}
