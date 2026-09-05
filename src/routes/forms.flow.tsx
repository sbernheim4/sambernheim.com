import type { SaveOrganizationResponse } from '../features/workspace/types'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { ActivityPanel, createActivity } from '../features/form-demos/ActivityPanel'
import { WorkspaceLayout } from '../features/workspace/components/WorkspaceLayout'
import { ResourceDataPanel } from '../features/workspace/components/ResourceDataPanel'
import {
  fetchBootstrap,
  saveOrganization,
  saveProject,
  saveTask,
} from '../features/workspace/api'
import { bootstrapKey } from '../features/workspace/queries'
import { upsertBootstrap } from '../features/workspace/cache'
import {
  budgetOptions,
  dueWindowOptions,
  ownerOptions,
  priorityOptions,
  regionOptions,
  sectorOptions,
} from '../features/workspace/fieldOptions'
import type { CacheUpdate } from '../forms/types'
import { useFlowForm } from '../forms/bindings/useFlowForm'

export const Route = createFileRoute('/forms/flow')({
  ssr: false,
  component: FlowFormRoute,
})

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

function FlowFormRoute() {
  const [activity, setActivity] = useState<
    Array<ReturnType<typeof createActivity>>
  >([])
  const bootstrap = useQuery({
    queryKey: bootstrapKey,
    queryFn: fetchBootstrap,
  })

  const appendActivity = (text: string) => {
    setActivity((items) => [createActivity(text), ...items])
  }

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
          mutationFn: saveOrganization,
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
          mutationFn: saveProject,
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
          mutationFn: saveTask,
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

  return (
    <WorkspaceLayout
      title="Dependent Save Flow"
      description="A guided resource creation workflow that saves three related records across separate endpoints."
    >
      <section className="forms-workspace app-workspace">
        <form
          className="form-panel app-form-panel flow-form-panel"
          onSubmit={(event) => {
            event.preventDefault()
            void launchForm.form.handleSubmit()
          }}
        >
          <div className="panel-heading">
            <div>
              <h2>Workspace Launch</h2>
              <p>Account, project, and first task</p>
            </div>
            <span>{launchForm.isSaving ? 'Saving' : 'Ready'}</span>
          </div>
          <div className="form-section-label">Organization</div>
          <launchForm.form.AppField name="organizationName">
            {(field) => (
              <field.TextField
                label="Organization"
                placeholder="Acme Health"
              />
            )}
          </launchForm.form.AppField>
          <div className="inline-fields">
            <launchForm.form.AppField name="organizationSector">
              {(field) => (
                <field.SelectField label="Sector" options={sectorOptions} />
              )}
            </launchForm.form.AppField>
            <launchForm.form.AppField name="organizationRegion">
              {(field) => (
                <field.SelectField label="Region" options={regionOptions} />
              )}
            </launchForm.form.AppField>
          </div>
          <div className="form-section-label">Project</div>
          <launchForm.form.AppField name="projectName">
            {(field) => (
              <field.TextField label="Project" placeholder="Patient Intake" />
            )}
          </launchForm.form.AppField>
          <div className="inline-fields">
            <launchForm.form.AppField name="projectPriority">
              {(field) => (
                <field.RadioGroupField
                  label="Priority"
                  options={priorityOptions}
                />
              )}
            </launchForm.form.AppField>
            <launchForm.form.AppField name="projectBudget">
              {(field) => (
                <field.SelectField label="Budget" options={budgetOptions} />
              )}
            </launchForm.form.AppField>
          </div>
          <div className="form-section-label">Task</div>
          <launchForm.form.AppField name="taskTitle">
            {(field) => (
              <field.TextField
                label="Task"
                placeholder="Provision workspace"
              />
            )}
          </launchForm.form.AppField>
          <div className="inline-fields">
            <launchForm.form.AppField name="taskOwner">
              {(field) => (
                <field.SelectField label="Owner" options={ownerOptions} />
              )}
            </launchForm.form.AppField>
            <launchForm.form.AppField name="taskDueWindow">
              {(field) => (
                <field.SelectField label="Due" options={dueWindowOptions} />
              )}
            </launchForm.form.AppField>
          </div>
          <launchForm.form.SubmitButton
            label="Save Flow"
            isSaving={launchForm.isSaving}
          />
          {launchForm.error ? (
            <p className="form-error">{String(launchForm.error)}</p>
          ) : null}
        </form>

        <ResourceDataPanel
          data={bootstrap.data}
          isError={bootstrap.isError}
          isFetching={bootstrap.isFetching}
        />
        <ActivityPanel activity={activity} />
      </section>
    </WorkspaceLayout>
  )
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
