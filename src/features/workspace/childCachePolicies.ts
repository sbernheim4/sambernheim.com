import type { CacheUpdate } from '../../forms/orchestration/contracts'
import type {
  BootstrapData,
  Organization,
  OrganizationProfile,
  OrganizationOperations,
  UpdateProfileInput,
  UpdateOperationsInput,
  ProfileResponse,
  OperationsResponse,
} from './types'
import { mergeProfile, mergeOperations, upsertBootstrap } from './cache.ts'
import { upsertList } from './cachePolicies.ts'
import { bootstrapKey, workspaceKeys as keys } from './queries.ts'

function summaryTargets<R, I, Child extends { organizationId: string }>(
  select: (response: R) => Child,
  merge: (
    previous: Organization | undefined,
    child: Child,
  ) => Organization | undefined,
  fallback?: Organization,
): CacheUpdate<R, I>[] {
  return [
    {
      queryKey: ({ response }) =>
        keys.organizations.detail(select(response).organizationId),
      update: (previous, { response }) =>
        merge(
          (previous as Organization | undefined) ?? fallback,
          select(response),
        ),
    },
    {
      queryKey: () => keys.organizations.list(),
      update: (previous, { response }) => {
        const child = select(response)
        const current = previous as Organization[] | undefined
        const organization = merge(
          current?.find((o) => o.id === child.organizationId) ?? fallback,
          child,
        )
        return organization ? upsertList(previous, organization) : previous
      },
    },
    {
      queryKey: () => bootstrapKey,
      update: (previous, { response }) => {
        const child = select(response)
        const current = previous as BootstrapData | undefined
        const organization = merge(
          current?.organizations.find((o) => o.id === child.organizationId) ??
            fallback,
          child,
        )
        return organization
          ? upsertBootstrap(previous, { organizations: [organization] })
          : previous
      },
    },
  ]
}
export function profileCacheUpdates(
  organization?: Organization,
): CacheUpdate<ProfileResponse, UpdateProfileInput>[] {
  return [
    {
      queryKey: ({ response }) =>
        keys.organizationProfiles.detail(response.profile.organizationId),
      getData: (response) => response.profile,
    },
    ...summaryTargets<
      ProfileResponse,
      UpdateProfileInput,
      OrganizationProfile
    >(
      (response) => response.profile,
      mergeProfile,
      organization,
    ),
  ]
}
export function operationsCacheUpdates(
  organization?: Organization,
): CacheUpdate<OperationsResponse, UpdateOperationsInput>[] {
  return [
    {
      queryKey: ({ response }) =>
        keys.organizationOperations.detail(response.operations.organizationId),
      getData: (response) => response.operations,
    },
    ...summaryTargets<
      OperationsResponse,
      UpdateOperationsInput,
      OrganizationOperations
    >((response) => response.operations, mergeOperations, organization),
  ]
}
