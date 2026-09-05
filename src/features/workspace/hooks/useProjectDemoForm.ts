import { useEffect } from 'react'
import { useQueryBackedForm } from '../../../forms/bindings/useQueryBackedForm'
import { useWorkspaceResources } from './useWorkspaceResources'
import { useCreateProject } from './mutations'
import { projectCacheUpdates } from '../cachePolicies'
import { workspaceKeys } from '../queries'

export function useProjectDemoForm(appendActivity: (text: string) => void) {
  const mutation = useCreateProject()
  const bootstrap = useWorkspaceResources()
  const firstOrganizationId = bootstrap.data?.organizations[0]?.id ?? ''
  const projectForm = useQueryBackedForm({
    defaultValues: {
      organizationId: firstOrganizationId,
      name: 'Patient Intake',
      priority: 'high' as const,
      phase: 'implementation' as const,
      budget: '$125k',
    },
    endpoint: {
      mutationFn: mutation.mutateAsync,
      invalidateQueryKeys: [workspaceKeys.all],
      cacheUpdates: projectCacheUpdates(),
    },
    onSuccess: ({ response }) => {
      appendActivity(`Endpoint effect: saved ${response.project.name}`)
      appendActivity(`Form effect: reconciled ${response.project.id}`)
    },
  })
  useEffect(() => {
    if (!firstOrganizationId) {
      projectForm.form.setFieldValue('organizationId', '')
      return
    }
    if (!projectForm.form.state.values.organizationId && firstOrganizationId) {
      projectForm.form.setFieldValue('organizationId', firstOrganizationId)
    }
  }, [firstOrganizationId, projectForm.form])

  return { projectForm, bootstrap }
}
