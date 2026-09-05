import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ActivityPanel, createActivity } from '../features/form-demos/ActivityPanel'
import { WorkspaceLayout } from '../features/workspace/components/WorkspaceLayout'
import { ResourceDataPanel } from '../features/workspace/components/ResourceDataPanel'
import { useFlowDemoForm } from '../features/workspace/hooks/useFlowDemoForm'
import {
  budgetOptions,
  dueWindowOptions,
  ownerOptions,
  priorityOptions,
  regionOptions,
  sectorOptions,
} from '../features/workspace/fieldOptions'

export const Route = createFileRoute('/forms/flow')({
  ssr: false,
  component: FlowFormRoute,
})

function FlowFormRoute() {
  const [activity, setActivity] = useState<
    Array<ReturnType<typeof createActivity>>
  >([])
  const { launchForm, bootstrap } = useFlowDemoForm((text) => { setActivity((items) => [createActivity(text), ...items]) })

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
