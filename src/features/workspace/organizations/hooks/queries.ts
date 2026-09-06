import { useQuery } from "@tanstack/react-query";
import * as api from "../../api";
import { reconcileWorkspaceRead } from "../../cache";
import { workspaceKeys as keys } from "../../queries";
import { useResourceQuery } from "../../hooks/useResourceQuery";
export const useOrganizations = () =>
  useQuery({
    structuralSharing: reconcileWorkspaceRead,
    queryKey: keys.organizations.list(),
    queryFn: api.fetchOrganizations,
  });

export const useOrganization = (id: string) =>
  useResourceQuery(keys.organizations.detail(id), () => api.fetchOrganization(id), !!id);

export const useOrganizationProfile = (id: string) =>
  useResourceQuery(
    keys.organizationProfiles.detail(id),
    () => api.fetchOrganizationProfile(id),
    !!id,
  );

export const useOrganizationOperations = (id: string) =>
  useResourceQuery(
    keys.organizationOperations.detail(id),
    () => api.fetchOrganizationOperations(id),
    !!id,
  );
