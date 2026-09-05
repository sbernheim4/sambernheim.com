import type { SaveOrganizationResponse, SaveProjectResponse } from '../types'
import { useWorkspaceResources } from '../hooks/useWorkspaceResources'
import { useCreateOrganization, useCreateProject, useCreateTask } from '../hooks/mutations'

import { workspaceKeys } from '../queries'
import { organizationCacheUpdates, projectCacheUpdates, taskCacheUpdates } from '../cachePolicies'
import { useFlowForm } from '../../../forms/bindings/useFlowForm'


type LaunchValues = {
  organizationName: string
  organizationSector: 'healthcare' | 'finance' | 'education'
  organizationRegion: 'east' | 'central' | 'west'
  projectName: string
  projectPriority: 'low' | 'medium' | 'high'
  projectBudget: string
  taskTitle: string
  taskOwner: 'alex' | 'jordan' | 'morgan'
  taskDueWindow: 'this-week' | 'next-week' | 'this-month'
}

type LaunchContext = {
  organization?: SaveOrganizationResponse['organization']
  project?: SaveProjectResponse['project']
}

export function useFlowDemoForm(appendActivity: (text: string) => void) {
  const createOrganization = useCreateOrganization()
  const createProject = useCreateProject()
  const createTask = useCreateTask()
  const bootstrap = useWorkspaceResources()



  const launchForm = useFlowForm<LaunchValues, LaunchContext>({
    defaultValues: {
      organizationName: 'Acme Health',
      organizationSector: 'healthcare',
      organizationRegion: 'east',
      projectName: 'Patient Intake',
      projectPriority: 'high',
      projectBudget: '$125k',
      taskTitle: 'Provision workspace',
      taskOwner: 'alex',
      taskDueWindow: 'this-week',
    },
    flow: {
      mutationKey: ['forms-example', 'launch-workspace'],
      buildInitialContext: () => ({}),
      invalidateQueryKeys: [workspaceKeys.all],
      steps: [
        {
          id: 'save-organization',
          buildInput: (_context, values) => ({
            name: values.organizationName,
            sector: values.organizationSector,
            region: values.organizationRegion,
            status: 'active',
          }),
          mutationFn: (input) => createOrganization.mutateAsync(input),
          cacheUpdates: organizationCacheUpdates(),
          assign: (context, response) => ({
            ...context,
            organization: response.organization,
          }),
          onSuccess: ({ response }) =>
              appendActivity(`Step A: saved ${response.organization.name}`),
        },
        {
          id: 'save-project',
          buildInput: (context, values) => ({
            organizationId: requireValue(context.organization, 'organization')
              .id,
            name: values.projectName,
            priority: values.projectPriority,
            phase: 'planning',
            budget: values.projectBudget,
          }),
          mutationFn: (input) => createProject.mutateAsync(input),
          cacheUpdates: projectCacheUpdates(),
          assign: (context, response) => ({
            ...context,
            project: response.project,
          }),
          onSuccess: ({ response }) =>
              appendActivity(`Step B: saved ${response.project.name}`),
        },
        {
          id: 'save-task',
          buildInput: (context, values) => {
            const organization = requireValue(
              context.organization,
              'organization',
            )
            const project = requireValue(context.project, 'project')

            return {
              organizationId: organization.id,
              projectId: project.id,
              title: values.taskTitle,
              owner: values.taskOwner,
              status: 'todo',
              dueWindow: values.taskDueWindow,
            }
          },
          mutationFn: (input) => createTask.mutateAsync(input),
          cacheUpdates: taskCacheUpdates(),
          onSuccess: ({ response }) => appendActivity(`Step C: saved ${response.task.title}`),
        },
      ],
      onSuccess: ({ flowContext }) =>
          appendActivity(
            `Flow effect: completed ${flowContext.organization?.name}`,
          ),
      onFailure: ({ error }) =>
        appendActivity(`Partial failure: ${String(error)}`),
    },
    onSuccess: ({ flowContext }) =>
        appendActivity(`Form effect: reconciled ${flowContext.project?.name}`),
  })

  return { launchForm, bootstrap }
}

function requireValue<TValue>(
  value: TValue | undefined,
  label: string,
): TValue {
  if (!value) {
    throw new Error(`Missing ${label} from an earlier flow step.`)
  }

  return value
}
