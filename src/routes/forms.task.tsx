import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ActivityPanel,
  createActivity,
} from '../features/form-demos/ActivityPanel'
import { WorkspaceLayout } from '../features/workspace/components/WorkspaceLayout'
import { ResourceDataPanel } from '../features/workspace/components/ResourceDataPanel'
import { useTaskDemoForm } from '../features/workspace/hooks/useTaskDemoForm'
import {
  dueWindowOptions,
  ownerOptions,
  taskStatusOptions,
} from '../features/workspace/fieldOptions'

export const Route = createFileRoute('/forms/task')({
  ssr: false,
  component: TaskFormRoute,
})

function TaskFormRoute() {
  const [activity, setActivity] = useState<
    Array<ReturnType<typeof createActivity>>
  >([])
  const { taskForm, bootstrap } = useTaskDemoForm((text) => {
    setActivity((items) => [createActivity(text), ...items])
  })

  return (
    <WorkspaceLayout
      title="Task Form"
      description="Create an execution task with owner, status, and a constrained delivery window."
      entity="task"
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
              <field.TextField
                label="Task title"
                placeholder="Provision workspace"
              />
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
