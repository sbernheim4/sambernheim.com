import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ActivityPanel,
  createActivity,
} from '../features/form-demos/ActivityPanel'
import { WorkspaceLayout } from '../features/workspace/components/WorkspaceLayout'
import { ResourceDataPanel } from '../features/workspace/components/ResourceDataPanel'
import { useOrganizationDemoForm } from '../features/workspace/hooks/useOrganizationDemoForm'
import {
  regionOptions,
  sectorOptions,
  statusOptions,
} from '../features/workspace/fieldOptions'

export const Route = createFileRoute('/forms/organization')({
  ssr: false,
  component: OrganizationFormRoute,
})

function OrganizationFormRoute() {
  const [activity, setActivity] = useState<
    Array<ReturnType<typeof createActivity>>
  >([])
  const { organizationForm, bootstrap } = useOrganizationDemoForm((text) => {
    setActivity((items) => [createActivity(text), ...items])
  })

  return (
    <WorkspaceLayout
      title="Organization Form"
      description="Create an account record with controlled sector, status, and regional ownership."
      entity="organization"
    >
      <section className="forms-workspace app-workspace">
        <form
          className="form-panel app-form-panel"
          onSubmit={(event) => {
            event.preventDefault()
            void organizationForm.form.handleSubmit()
          }}
        >
          <div className="panel-heading">
            <div>
              <h2>Account Profile</h2>
              <p>Primary resource details</p>
            </div>
            <span>{organizationForm.isSaving ? 'Saving' : 'Ready'}</span>
          </div>
          <organizationForm.form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Organization name"
                placeholder="Northstar Labs"
              />
            )}
          </organizationForm.form.AppField>
          <div className="inline-fields">
            <organizationForm.form.AppField name="sector">
              {(field) => (
                <field.SelectField label="Sector" options={sectorOptions} />
              )}
            </organizationForm.form.AppField>
            <organizationForm.form.AppField name="status">
              {(field) => (
                <field.SelectField label="Status" options={statusOptions} />
              )}
            </organizationForm.form.AppField>
          </div>
          <organizationForm.form.AppField name="region">
            {(field) => (
              <field.RadioGroupField label="Region" options={regionOptions} />
            )}
          </organizationForm.form.AppField>
          <organizationForm.form.SubmitButton
            label="Save Organization"
            isSaving={organizationForm.isSaving}
          />
          {organizationForm.error ? (
            <p className="form-error">{String(organizationForm.error)}</p>
          ) : null}
        </form>

        <ResourceDataPanel
          data={bootstrap.data}
          isError={bootstrap.isError}
          isFetching={bootstrap.isFetching}
          focus="organizations"
        />
        <ActivityPanel activity={activity} />
      </section>
    </WorkspaceLayout>
  )
}
