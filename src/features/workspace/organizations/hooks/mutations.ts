import { useMutation } from "@tanstack/react-query";
import * as api from "../../api";
import { workspaceKeys } from "../../queries";
export const useCreateOrganization = () =>
  useMutation({
    mutationKey: [...workspaceKeys.organizations.all, "create"],
    mutationFn: api.saveOrganization,
    retry: false,
  });

export const useUpdateOrganization = (id: string) =>
  useMutation({
    mutationKey: [...workspaceKeys.organizations.detail(id), "update"],
    mutationFn: (input: Parameters<typeof api.updateOrganization>[1]) =>
      api.updateOrganization(id, input),
    retry: false,
  });

export const useUpdateOrganizationProfile = (id: string) =>
  useMutation({
    mutationKey: [...workspaceKeys.organizationProfiles.detail(id), "update"],
    mutationFn: (input: Parameters<typeof api.updateOrganizationProfile>[1]) =>
      api.updateOrganizationProfile(id, input),
    retry: false,
  });

export const useUpdateOrganizationOperations = (id: string) =>
  useMutation({
    mutationKey: [...workspaceKeys.organizationOperations.detail(id), "update"],
    mutationFn: (input: Parameters<typeof api.updateOrganizationOperations>[1]) =>
      api.updateOrganizationOperations(id, input),
    retry: false,
  });
