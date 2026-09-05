import { useEffect } from 'react'
import { useQueryBackedForm } from '../../../forms/bindings/useQueryBackedForm'
import { useWorkspaceResources } from './useWorkspaceResources'
import { useCreateTask } from './mutations'
import { taskCacheUpdates } from '../cachePolicies'
import { workspaceKeys } from '../queries'

export function useTaskDemoForm(appendActivity: (text: string) => void) {
  const mutation = useCreateTask()
  const bootstrap = useWorkspaceResources()
  const firstProject = bootstrap.data?.projects[0]
  const taskForm = useQueryBackedForm({
    defaultValues: {
      organizationId: firstProject?.organizationId ?? '',
      projectId: firstProject?.id ?? '',
      title: 'Provision workspace',
      owner: 'alex' as const,
      status: 'todo' as const,
      dueWindow: 'this-week' as const,
    },
    endpoint: {
      mutationFn: mutation.mutateAsync,
      invalidateQueryKeys: [workspaceKeys.all],
      cacheUpdates: taskCacheUpdates(),
    },
    onSuccess: ({ response }) => {
      appendActivity(`Endpoint effect: saved ${response.task.title}`)
      appendActivity(`Form effect: reconciled ${response.task.id}`)
    },
  })
  useEffect(() => {
    if (!firstProject) {
      taskForm.form.setFieldValue('projectId', '')
      taskForm.form.setFieldValue('organizationId', '')
      return
    }

    if (!taskForm.form.state.values.projectId) {
      taskForm.form.setFieldValue('projectId', firstProject.id)
    }

    if (!taskForm.form.state.values.organizationId) {
      taskForm.form.setFieldValue('organizationId', firstProject.organizationId)
    }
  }, [firstProject, taskForm.form])

  return { taskForm, bootstrap }
}
