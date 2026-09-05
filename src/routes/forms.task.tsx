import { createFileRoute } from '@tanstack/react-router'
import { useWorkspaceResources } from '../features/workspace/hooks/useWorkspaceResources'
import { useCreateOrganization, useCreateProject, useCreateTask } from '../features/workspace/hooks/mutations'
import { useEffect, useState } from 'react'

import { ActivityPanel, createActivity } from '../features/form-demos/ActivityPanel'
import { WorkspaceLayout } from '../features/workspace/components/WorkspaceLayout'
import { ResourceDataPanel } from '../features/workspace/components/ResourceDataPanel'
import { fetchBootstrap, saveTask } from '../features/workspace/api'
import { bootstrapKey } from '../features/workspace/queries'
import { upsertBootstrap } from '../features/workspace/cache'
import {
  dueWindowOptions,
  ownerOptions,
  taskStatusOptions,
} from '../features/workspace/fieldOptions'
import { useQueryBackedForm } from '../forms/bindings/useQueryBackedForm'

export const Route = createFileRoute('/forms/task')({
  ssr: false,
  component: TaskFormRoute,
})

function TaskFormRoute() {
  const [activity, setActivity] = useState<
    Array<ReturnType<typeof createActivity>>
  >([])
  const createOrganization = useCreateOrganization()
  const createProject = useCreateProject()
  const createTask = useCreateTask()
  const bootstrap = useWorkspaceResources()
  const firstProject = bootstrap.data?.projects[0]

  const appendActivity = (text: string) => {
    setActivity((items) => [createActivity(text), ...items])
  }

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
      mutationKey: ['forms-example', 'save-task'],
      mutationFn: createTask.mutateAsync,
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
        ({ response }) =>
          appendActivity(`Endpoint effect: saved ${response.task.title}`),
      ],
    },
    afterEffects: [
      ({ response }) =>
        appendActivity(`Form effect: reconciled ${response.task.id}`),
    ],
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

  return (
    <WorkspaceLayout
      title="Task Form"
      description="Create an execution task with owner, status, and a constrained delivery window."
    >
      <section className="forms-workspace app-workspace">
        <form
          className="form-panel app-form-panel"
          onSubmit={(event) => {
            event.preventDefault()
            void taskForm.form.handleSubmit()
          }}
        >
          <div className="panel-heading">
            <div>
              <h2>Work Item</h2>
              <p>Assignment and delivery state</p>
            </div>
            <span>{taskForm.isSaving ? 'Saving' : 'Ready'}</span>
          </div>
          <taskForm.form.AppField name="projectId">
            {(field) => (
              <field.SelectField
                label="Project"
                placeholder="Select project"
                onValueChange={(projectId) => {
                  const project = bootstrap.data?.projects.find(
                    (item) => item.id === projectId,
                  )
                  taskForm.form.setFieldValue(
                    'organizationId',
                    project?.organizationId ?? '',
                  )
                }}
                options={
                  bootstrap.data?.projects.map((project) => ({
                    value: project.id,
                    label: project.name,
                  })) ?? []
                }
              />
            )}
          </taskForm.form.AppField>
          <taskForm.form.AppField name="organizationId">
            {(field) => (
              <field.TextField label="Organization id" placeholder="org-1" />
            )}
          </taskForm.form.AppField>
          <taskForm.form.AppField name="title">
            {(field) => (
              <field.TextField label="Task title" placeholder="Provision workspace" />
            )}
          </taskForm.form.AppField>
          <div className="inline-fields">
            <taskForm.form.AppField name="owner">
              {(field) => (
                <field.SelectField label="Owner" options={ownerOptions} />
              )}
            </taskForm.form.AppField>
            <taskForm.form.AppField name="dueWindow">
              {(field) => (
                <field.SelectField
                  label="Due window"
                  options={dueWindowOptions}
                />
              )}
            </taskForm.form.AppField>
          </div>
          <taskForm.form.AppField name="status">
            {(field) => (
              <field.RadioGroupField
                label="Status"
                options={taskStatusOptions}
              />
            )}
          </taskForm.form.AppField>
          <taskForm.form.SubmitButton
            label="Save Task"
            isSaving={taskForm.isSaving}
          />
          {taskForm.error ? (
            <p className="form-error">{String(taskForm.error)}</p>
          ) : null}
        </form>

        <ResourceDataPanel
          data={bootstrap.data}
          isError={bootstrap.isError}
          isFetching={bootstrap.isFetching}
          focus="tasks"
        />
        <ActivityPanel activity={activity} />
      </section>
    </WorkspaceLayout>
  )
}
