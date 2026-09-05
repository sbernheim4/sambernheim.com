import type { SaveOrganizationResponse } from '../types'
import { useWorkspaceResources } from '../hooks/useWorkspaceResources'
import { useCreateOrganization, useCreateProject, useCreateTask } from '../hooks/mutations'
import { useMemo } from 'react'

import {
  fetchBootstrap,
  saveOrganization,
  saveProject,
  saveTask,
} from '../api'
import { bootstrapKey } from '../queries'
import { upsertBootstrap } from '../cache'
import {
  budgetOptions,
  dueWindowOptions,
  ownerOptions,
  priorityOptions,
  regionOptions,
  sectorOptions,
} from '../fieldOptions'
import type { CacheUpdate } from '../../../forms/types'
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
  project?: Awaited<ReturnType<typeof saveProject>>['project']
}

export function useFlowDemoForm(appendActivity: (text: string) => void) {
  const createOrganization = useCreateOrganization()
  const createProject = useCreateProject()
  const createTask = useCreateTask()
  const bootstrap = useWorkspaceResources()



  const organizationCacheUpdate = useMemo(
    () =>
      ({
        queryKey: bootstrapKey,
        update: (previous, context) =>
          upsertBootstrap(previous, {
            organizations: [context.response.organization],
          }),
      }) satisfies CacheUpdate<
        SaveOrganizationResponse,
        Parameters<typeof saveOrganization>[0]
      >,
    [],
  )

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
      refetchPolicy: { invalidate: [bootstrapKey] },
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
          refetchPolicy: {
            refetchQueries: [bootstrapKey],
          },
          cacheUpdates: [organizationCacheUpdate],
          assign: (context, response) => ({
            ...context,
            organization: response.organization,
          }),
          afterEffects: [
            ({ response }) =>
              appendActivity(`Step A: saved ${response.organization.name}`),
          ],
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
          refetchPolicy: {
            refetchQueries: [bootstrapKey],
          },
          cacheUpdates: [
            {
              queryKey: bootstrapKey,
              update: (previous, context) =>
                upsertBootstrap(previous, {
                  projects: [context.response.project],
                }),
            },
          ],
          assign: (context, response) => ({
            ...context,
            project: response.project,
          }),
          afterEffects: [
            ({ response }) =>
              appendActivity(`Step B: saved ${response.project.name}`),
          ],
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
          refetchPolicy: {
            refetchQueries: [bootstrapKey],
          },
          cacheUpdates: [
            {
              queryKey: bootstrapKey,
              update: (previous, context) =>
                upsertBootstrap(previous, {
                  tasks: [context.response.task],
                }),
            },
          ],
          afterEffects: [
            ({ response }) => appendActivity(`Step C: saved ${response.task.title}`),
          ],
        },
      ],
      afterEffects: [
        ({ flowContext }) =>
          appendActivity(
            `Flow effect: completed ${flowContext.organization?.name}`,
          ),
      ],
      onPartialFailure: (error) =>
        appendActivity(`Partial failure: ${String(error)}`),
    },
    afterEffects: [
      ({ flowContext }) =>
        appendActivity(`Form effect: reconciled ${flowContext.project?.name}`),
    ],
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
