import { useComposableForm } from "../../../../forms/hooks/useComposableForm";
import type { OutcomeCallbacks } from "../../../../forms/orchestration/types";
import { operationsCacheUpdates, profileCacheUpdates } from "../../childCachePolicies";
import { workspaceKeys } from "../../queries";
import type {
  OperationsInput,
  OperationsResponse,
  OrganizationOperations,
  OrganizationProfile,
  ProfileResponse,
  UpdateOperationsInput,
  UpdateProfileInput,
} from "../../types";
import { useUpdateOrganizationOperations, useUpdateOrganizationProfile } from "./mutations";
import { useOrganization, useOrganizationOperations, useOrganizationProfile } from "./queries";

type ProfileValues = {
  displayName: string;
  selectedSector: OrganizationProfile["sector"];
};
type OperationsValues = {
  isActive: boolean;
  region: OrganizationOperations["region"];
};
export function useOrganizationProfileForm({
  organizationId,
  ...callbacks
}: { organizationId: string } & OutcomeCallbacks<
  ProfileValues,
  UpdateProfileInput,
  ProfileResponse
>) {
  const query = useOrganizationProfile(organizationId);
  const organization = useOrganization(organizationId);
  const mutation = useUpdateOrganizationProfile(organizationId);
  const binding = useComposableForm({
    id: "profile",
    defaultValues: {
      displayName: "",
      selectedSector: "healthcare",
    } as ProfileValues,
    query,
    ...callbacks,
    toFormData: (profile): ProfileValues => ({
      displayName: profile.name,
      selectedSector: profile.sector,
    }),
    toMutationPayload: (values) => ({
      name: values.displayName.trim(),
      sector: values.selectedSector,
    }),
    validate: (values) =>
      !values.displayName.trim() ? "Organization name is required." : undefined,
    endpoint: {
      mutationFn: mutation.mutateAsync,
      retrySafe: true,
    },
    refetchFunctions: [query.refetch],
    invalidateQueryKeys: [workspaceKeys.organizations.all],
    cacheUpdates: profileCacheUpdates(organization.data),
  });

  return { ...binding, retryRead: query.refetch };
}
export function useOrganizationOperationsForm({
  organizationId,
  ...callbacks
}: { organizationId: string } & OutcomeCallbacks<
  OperationsValues,
  UpdateOperationsInput,
  OperationsResponse
>) {
  const query = useOrganizationOperations(organizationId);
  const organization = useOrganization(organizationId);
  const mutation = useUpdateOrganizationOperations(organizationId);
  const binding = useComposableForm({
    id: "operations",
    defaultValues: { isActive: false, region: "east" } as OperationsValues,
    query,
    ...callbacks,
    toFormData: (operations): OperationsValues => ({
      isActive: operations.status === "active",
      region: operations.region,
    }),
    toMutationPayload: (values): OperationsInput => ({
      status: values.isActive ? "active" : "paused",
      region: values.region,
    }),
    endpoint: {
      mutationFn: mutation.mutateAsync,
      retrySafe: true,
    },
    refetchFunctions: [query.refetch],
    invalidateQueryKeys: [workspaceKeys.organizations.all],
    cacheUpdates: operationsCacheUpdates(organization.data),
  });
  return { ...binding, retryRead: query.refetch };
}
