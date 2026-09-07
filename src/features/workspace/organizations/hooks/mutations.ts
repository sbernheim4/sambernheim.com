import { organizationKey, organizationListsKey, organizationOperationsKey, organizationProfileKey } from "../queryOptions";
import { useMutation } from "@tanstack/react-query";
import * as api from "../../api";
export const useCreateOrganization = () =>
  useMutation({
    mutationKey: [...organizationListsKey(), "create"],
    mutationFn: api.saveOrganization,
    retry: false,
  });

export const useUpdateOrganization = (id: string) =>
  useMutation({
    mutationKey: [...organizationKey(id), "update"],
    mutationFn: (input: Parameters<typeof api.updateOrganization>[1]) =>
      api.updateOrganization(id, input),
    retry: false,
  });

export const useUpdateOrganizationProfile = (id: string) =>
  useMutation({
    mutationKey: [...organizationProfileKey(id), "update"],
    mutationFn: (input: Parameters<typeof api.updateOrganizationProfile>[1]) =>
      api.updateOrganizationProfile(id, input),
    retry: false,
  });

export const useUpdateOrganizationOperations = (id: string) =>
  useMutation({
    mutationKey: [...organizationOperationsKey(id), "update"],
    mutationFn: (input: Parameters<typeof api.updateOrganizationOperations>[1]) =>
      api.updateOrganizationOperations(id, input),
    retry: false,
  });
