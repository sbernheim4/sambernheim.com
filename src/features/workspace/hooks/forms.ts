import { useQueryBackedForm } from '../../../forms/bindings/useQueryBackedForm'
import type { Organization, Project, Task, SaveOrganizationInput, SaveProjectInput, SaveTaskInput } from '../types'
import { useOrganization, useProject, useTask } from './useWorkspaceResources'
import { useCreateOrganization, useCreateProject, useCreateTask, useUpdateOrganization, useUpdateProject, useUpdateTask } from './mutations'
import { organizationCacheUpdates, projectCacheUpdates, taskCacheUpdates } from '../cachePolicies'
import { workspaceKeys } from '../queries'
import { sectorOptions, statusOptions, regionOptions, priorityOptions, phaseOptions, budgetOptions, ownerOptions, taskStatusOptions, dueWindowOptions } from '../fieldOptions'

export type EditorField = { name: string; label: string; mode?: 'select' | 'radio'; options?: readonly { value: string; label: string }[] }
const organizationFields: EditorField[] = [
  { name: 'name', label: 'Organization name' }, { name: 'sector', label: 'Sector', mode: 'select', options: sectorOptions },
  { name: 'status', label: 'Status', mode: 'radio', options: statusOptions }, { name: 'region', label: 'Region', mode: 'select', options: regionOptions },
]
const projectFields: EditorField[] = [
  { name: 'name', label: 'Project name' }, { name: 'priority', label: 'Priority', mode: 'radio', options: priorityOptions },
  { name: 'phase', label: 'Phase', mode: 'select', options: phaseOptions }, { name: 'budget', label: 'Budget', mode: 'select', options: budgetOptions },
]
const taskFields: EditorField[] = [
  { name: 'title', label: 'Task title' }, { name: 'owner', label: 'Owner', mode: 'select', options: ownerOptions },
  { name: 'status', label: 'Status', mode: 'radio', options: taskStatusOptions }, { name: 'dueWindow', label: 'Due', mode: 'select', options: dueWindowOptions },
]
export function useOrganizationForm({ resource, onSuccess }: { resource?: Organization; onSuccess?: () => void }) {
  const query = useOrganization(resource?.id ?? '')
  const create = useCreateOrganization(); const update = useUpdateOrganization(resource?.id ?? '')
  const form = useQueryBackedForm({ query: resource ? query : undefined,
    defaultValues: { name: '', sector: 'healthcare', status: 'active', region: 'east' } as Record<string, string>,
    toFormData: (data: Organization): Record<string, string> => ({ name: data.name, sector: data.sector, status: data.status, region: data.region }),
    toMutationPayload: (values): SaveOrganizationInput => ({ name: values.name.trim(), sector: option(values.sector, sectorOptions), status: option(values.status, statusOptions), region: option(values.region, regionOptions) }),
    validate: (values) => !values.name?.trim() ? 'Organization name is required.' : undefined,
    endpoint: { mutationFn: resource ? update.mutateAsync : create.mutateAsync, retrySafe: !!resource, invalidateQueryKeys: [workspaceKeys.all], cacheUpdates: organizationCacheUpdates() }, onSuccess,
  })
  return { ...form, fields: organizationFields }
}
export function useProjectForm({ resource, organizationId, onSuccess }: { resource?: Project; organizationId: string; onSuccess?: () => void }) {
  const query = useProject(resource?.id ?? '')
  const create = useCreateProject(); const update = useUpdateProject(resource?.id ?? '')
  const form = useQueryBackedForm({ query: resource ? query : undefined,
    defaultValues: { name: '', priority: 'medium', phase: 'planning', budget: '$50k' } as Record<string, string>,
    toFormData: (data: Project): Record<string, string> => ({ name: data.name, priority: data.priority, phase: data.phase, budget: data.budget }),
    toMutationPayload: (values): SaveProjectInput => ({ organizationId, name: values.name.trim(), priority: option(values.priority, priorityOptions), phase: option(values.phase, phaseOptions), budget: values.budget }),
    validate: (values) => !values.name?.trim() ? 'Project name is required.' : undefined,
    endpoint: { mutationFn: resource ? update.mutateAsync : create.mutateAsync, retrySafe: !!resource, invalidateQueryKeys: [workspaceKeys.all], cacheUpdates: projectCacheUpdates() }, onSuccess,
  })
  return { ...form, fields: projectFields }
}
export function useTaskForm({ resource, project, onSuccess }: { resource?: Task; project: Project; onSuccess?: () => void }) {
  const query = useTask(resource?.id ?? '')
  const create = useCreateTask(); const update = useUpdateTask(resource?.id ?? '')
  const form = useQueryBackedForm({ query: resource ? query : undefined,
    defaultValues: { title: '', owner: 'alex', status: 'todo', dueWindow: 'this-week' } as Record<string, string>,
    toFormData: (data: Task): Record<string, string> => ({ title: data.title, owner: data.owner, status: data.status, dueWindow: data.dueWindow }),
    toMutationPayload: (values): SaveTaskInput => ({ organizationId: project.organizationId, projectId: project.id, title: values.title.trim(), owner: option(values.owner, ownerOptions), status: option(values.status, taskStatusOptions), dueWindow: option(values.dueWindow, dueWindowOptions) }),
    validate: (values) => !values.title?.trim() ? 'Task title is required.' : undefined,
    endpoint: { mutationFn: resource ? update.mutateAsync : create.mutateAsync, retrySafe: !!resource, invalidateQueryKeys: [workspaceKeys.all], cacheUpdates: taskCacheUpdates() }, onSuccess,
  })
  return { ...form, fields: taskFields }
}
function option<T extends string>(value: string, options: readonly { value: T }[]): T {
  const match = options.find((item) => item.value === value)
  if (!match) throw new Error('Choose a valid option.')
  return match.value
}
