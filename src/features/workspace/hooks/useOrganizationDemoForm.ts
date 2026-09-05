import { useEffect } from 'react'
import { useQueryBackedForm } from '../../../forms/bindings/useQueryBackedForm'
import { useWorkspaceResources } from './useWorkspaceResources'
import { useCreateOrganization } from './mutations'
import { organizationCacheUpdates } from '../cachePolicies'
import { workspaceKeys } from '../queries'

export function useOrganizationDemoForm(appendActivity: (text: string) => void) {
  const mutation = useCreateOrganization()
  const bootstrap = useWorkspaceResources()
  const organizationForm = useQueryBackedForm({
    defaultValues: {
      name: 'Northstar Labs',
      sector: 'healthcare' as const,
      status: 'active' as const,
      region: 'east' as const,
    },
    endpoint: {
      mutationFn: mutation.mutateAsync,
      invalidateQueryKeys: [workspaceKeys.all],
      cacheUpdates: organizationCacheUpdates(),
    },
    onSuccess: ({ response }) => {
      appendActivity(`Endpoint effect: saved ${response.organization.name}`)
      appendActivity(`Form effect: reconciled ${response.organization.id}`)
    },
  })

  return { organizationForm, bootstrap }
}
