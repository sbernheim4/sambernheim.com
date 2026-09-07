import { bootstrapKey } from "./queryOptions";
import { organizationKey, organizationOperationsKey, organizationProfileKey, organizationsKey } from "./organizations/queryOptions";
import type { CacheUpdate } from "../../forms/orchestration/types";
import { mergeOperations, mergeProfile, upsertBootstrap } from "./cache";
import { upsertList } from "./cachePolicies";
import type {
  BootstrapData,
  OperationsResponse,
  Organization,
  OrganizationOperations,
  OrganizationProfile,
  ProfileResponse,
  UpdateOperationsInput,
  UpdateProfileInput,
} from "./types";

function summaryTargets<R, I, Child extends { organizationId: string }>(
  select: (response: R) => Child,
  merge: (previous: Organization | undefined, child: Child) => Organization | undefined,
  fallback?: Organization,
): CacheUpdate<R, I>[] {
  return [
    {
      queryKey: ({ response }) => organizationKey(select(response).organizationId),
      update: (previous, { response }) =>
        merge((previous as Organization | undefined) ?? fallback, select(response)),
    },
    {
      queryKey: () => organizationsKey(),
      update: (previous, { response }) => {
        const child = select(response);
        const current = previous as Organization[] | undefined;
        const organization = merge(
          current?.find((o) => o.id === child.organizationId) ?? fallback,
          child,
        );
        return organization ? upsertList(previous, organization) : previous;
      },
    },
    {
      queryKey: () => bootstrapKey(),
      update: (previous, { response }) => {
        const child = select(response);
        const current = previous as BootstrapData | undefined;
        const organization = merge(
          current?.organizations.find((o) => o.id === child.organizationId) ?? fallback,
          child,
        );
        return organization
          ? upsertBootstrap(previous, { organizations: [organization] })
          : previous;
      },
    },
  ];
}
export function profileCacheUpdates(
  organization?: Organization,
): CacheUpdate<ProfileResponse, UpdateProfileInput>[] {
  return [
    {
      queryKey: ({ response }) => organizationProfileKey(response.profile.organizationId),
      getData: (response) => response.profile,
    },
    ...summaryTargets<ProfileResponse, UpdateProfileInput, OrganizationProfile>(
      (response) => response.profile,
      mergeProfile,
      organization,
    ),
  ];
}
export function operationsCacheUpdates(
  organization?: Organization,
): CacheUpdate<OperationsResponse, UpdateOperationsInput>[] {
  return [
    {
      queryKey: ({ response }) =>
        organizationOperationsKey(response.operations.organizationId),
      getData: (response) => response.operations,
    },
    ...summaryTargets<OperationsResponse, UpdateOperationsInput, OrganizationOperations>(
      (response) => response.operations,
      mergeOperations,
      organization,
    ),
  ];
}
