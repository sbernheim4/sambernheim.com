import { useComposableForm } from '../../../forms/bindings/useComposableForm'
import type { OutcomeCallbacks } from '../../../forms/orchestration/contracts'
import type {
  OrganizationProfile,
  OrganizationOperations,
  ProfileInput,
  OperationsInput,
  ProfileResponse,
  OperationsResponse,
} from '../types'
import {
  useOrganization,
  useOrganizationProfile,
  useOrganizationOperations,
} from './useWorkspaceResources'
import {
  useUpdateOrganizationProfile,
  useUpdateOrganizationOperations,
} from './mutations'
import {
  profileCacheUpdates,
  operationsCacheUpdates,
} from '../childCachePolicies'
import { workspaceKeys } from '../queries'

type ProfileValues = {
  displayName: string
  selectedSector: OrganizationProfile['sector']
}
type OperationsValues = {
  isActive: boolean
  region: OrganizationOperations['region']
}
export function useOrganizationProfileForm({
  organizationId,
  ...callbacks
}: { organizationId: string } & OutcomeCallbacks<
  ProfileValues,
  ProfileInput,
  ProfileResponse
>) {
  const query = useOrganizationProfile(organizationId)
  const organization = useOrganization(organizationId)
  const mutation = useUpdateOrganizationProfile(organizationId)
  const binding = useComposableForm({
    id: 'profile',
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
      !values.displayName.trim() ? 'Organization name is required.' : undefined,
    endpoint: {
      mutationFn: mutation.mutateAsync,
      retrySafe: true,
      refetchFunctions: [query.refetch],
      invalidateQueryKeys: [workspaceKeys.organizations.all],
      cacheUpdates: profileCacheUpdates(organization.data),
    },
  })
  return { ...binding, retryRead: query.refetch }
}
export function useOrganizationOperationsForm({
  organizationId,
  ...callbacks
}: { organizationId: string } & OutcomeCallbacks<
  OperationsValues,
  OperationsInput,
  OperationsResponse
>) {
  const query = useOrganizationOperations(organizationId)
  const organization = useOrganization(organizationId)
  const mutation = useUpdateOrganizationOperations(organizationId)
  const binding = useComposableForm({
    id: 'operations',
    query,
    ...callbacks,
    toFormData: (operations): OperationsValues => ({
      isActive: operations.status === 'active',
      region: operations.region,
    }),
    toMutationPayload: (values): OperationsInput => ({
      status: values.isActive ? 'active' : 'paused',
      region: values.region,
    }),
    endpoint: {
      mutationFn: mutation.mutateAsync,
      retrySafe: true,
      refetchFunctions: [query.refetch],
      invalidateQueryKeys: [workspaceKeys.organizations.all],
      cacheUpdates: operationsCacheUpdates(organization.data),
    },
  })
  return { ...binding, retryRead: query.refetch }
}
