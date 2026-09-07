import { queryOptions } from "@tanstack/react-query";
import * as api from "../api";
import { workspaceKey } from "../queryOptions";
export const organizationListsKey = () => {
  return [...workspaceKey(), "organizations", "list"] as const;
};
export const organizationsKey = () => {
  return [...organizationListsKey(), "all"] as const;
};
export const organizationsQueryOptions = () => {
  return queryOptions({ queryKey: organizationsKey(), queryFn: api.fetchOrganizations });
};
export const organizationKey = (id: string) => {
  return [...workspaceKey(), "organizations", "detail", id] as const;
};
export const organizationQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: organizationKey(id),
    queryFn: () => {
      return api.fetchOrganization(id);
    },
    enabled: !!id,
    retry: (attempt, error) => {
      return !(error instanceof api.ApiError && error.status < 500) && attempt < 1;
    },
  });
};
export const organizationProfileKey = (id: string) => {
  return [...workspaceKey(), "organization-profiles", "detail", id] as const;
};
export const organizationProfileQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: organizationProfileKey(id),
    queryFn: () => {
      return api.fetchOrganizationProfile(id);
    },
    enabled: !!id,
    retry: (attempt, error) => {
      return !(error instanceof api.ApiError && error.status < 500) && attempt < 1;
    },
  });
};
export const organizationOperationsKey = (id: string) => {
  return [...workspaceKey(), "organization-operations", "detail", id] as const;
};
export const organizationOperationsQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: organizationOperationsKey(id),
    queryFn: () => {
      return api.fetchOrganizationOperations(id);
    },
    enabled: !!id,
    retry: (attempt, error) => {
      return !(error instanceof api.ApiError && error.status < 500) && attempt < 1;
    },
  });
};
