import { useQuery } from "@tanstack/react-query";
import { organizationsQueryOptions, organizationQueryOptions, organizationProfileQueryOptions, organizationOperationsQueryOptions } from "../queryOptions";
export const useOrganizations = () => { return useQuery(organizationsQueryOptions()); };
export const useOrganization = (id: string) => { return useQuery(organizationQueryOptions(id)); };
export const useOrganizationProfile = (id: string) => { return useQuery(organizationProfileQueryOptions(id)); };
export const useOrganizationOperations = (id: string) => { return useQuery(organizationOperationsQueryOptions(id)); };
