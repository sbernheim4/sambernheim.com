import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ActivityPanel,
  createActivity,
} from '../features/form-demos/ActivityPanel'
import { WorkspaceLayout } from '../features/workspace/components/WorkspaceLayout'
import { ResourceDataPanel } from '../features/workspace/components/ResourceDataPanel'
import { useProjectDemoForm } from '../features/workspace/hooks/useProjectDemoForm'
import {
  budgetOptions,
  phaseOptions,
  priorityOptions,
} from '../features/workspace/fieldOptions'

export const Route = createFileRoute('/forms/project')({
  ssr: false,
  component: ProjectFormRoute,
})

function ProjectFormRoute() {
  const [activity, setActivity] = useState<
    Array<ReturnType<typeof createActivity>>
  >([])
  const { projectForm, bootstrap } = useProjectDemoForm((text) => {
    setActivity((items) => [createActivity(text), ...items])
  })

  return (
    <WorkspaceLayout
      title="Project Form"
      description="Plan a project resource with priority, lifecycle phase, and budget metadata."
      entity="project"
    >
      <section className="forms-workspace app-workspace">
        <form
          className="form-panel app-form-panel"
          onSubmit={(event) => {
            event.preventDefault()
            void projectForm.form.handleSubmit()
          }}
        >
          <div className="panel-heading">
            <div>
              <h2>Project Brief</h2>
              <p>Scope and delivery controls</p>
            </div>
            <span>{projectForm.isSaving ? 'Saving' : 'Ready'}</span>
          </div>
          <projectForm.form.AppField name="organizationId">
            {(field) => (
              <field.SelectField
                label="Organization"
                placeholder="Select organization"
                options={
                  bootstrap.data?.organizations.map((organization) => ({
                    value: organization.id,
                    label: organization.name,
                  })) ?? []
                }
              />
            )}
          </projectForm.form.AppField>
          <projectForm.form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Project name"
                placeholder="Patient Intake"
              />
            )}
          </projectForm.form.AppField>
          <projectForm.form.AppField name="priority">
            {(field) => (
              <field.RadioGroupField
                label="Priority"
                options={priorityOptions}
              />
            )}
          </projectForm.form.AppField>
          <div className="inline-fields">
            <projectForm.form.AppField name="phase">
              {(field) => (
                <field.SelectField label="Phase" options={phaseOptions} />
              )}
            </projectForm.form.AppField>
            <projectForm.form.AppField name="budget">
              {(field) => (
                <field.SelectField label="Budget" options={budgetOptions} />
              )}
            </projectForm.form.AppField>
          </div>
          <projectForm.form.SubmitButton
            label="Save Project"
            isSaving={projectForm.isSaving}
          />
          {projectForm.error ? (
            <p className="form-error">{String(projectForm.error)}</p>
          ) : null}
        </form>

        <ResourceDataPanel
          data={bootstrap.data}
          isError={bootstrap.isError}
          isFetching={bootstrap.isFetching}
          focus="projects"
        />
        <ActivityPanel activity={activity} />
      </section>
    </WorkspaceLayout>
  )
}
