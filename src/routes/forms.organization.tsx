import type { SaveOrganizationResponse } from '../features/workspace/types'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { ActivityPanel, createActivity } from '../features/form-demos/ActivityPanel'
import { WorkspaceLayout } from '../features/workspace/components/WorkspaceLayout'
import { ResourceDataPanel } from '../features/workspace/components/ResourceDataPanel'
import {  fetchBootstrap, saveOrganization } from '../features/workspace/api'
import { bootstrapKey } from '../features/workspace/queries'
import { upsertBootstrap } from '../features/workspace/cache'
import {
  regionOptions,
  sectorOptions,
  statusOptions,
} from '../features/workspace/fieldOptions'
import type { CacheUpdate } from '../forms/types'
import { useQueryBackedForm } from '../forms/bindings/useQueryBackedForm'

export const Route = createFileRoute('/forms/organization')({
  ssr: false,
  component: OrganizationFormRoute,
})

function OrganizationFormRoute() {
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

  const organizationForm = useQueryBackedForm({
    defaultValues: {
      name: 'Northstar Labs',
      sector: 'healthcare' as const,
      status: 'active' as const,
      region: 'east' as const,
    },
    endpoint: {
      mutationKey: ['forms-example', 'save-organization'],
      mutationFn: saveOrganization,
      refetchPolicy: {
        refetchQueries: [bootstrapKey],
      },
      cacheUpdates: [organizationCacheUpdate],
      afterEffects: [
        ({ response }) =>
          appendActivity(`Endpoint effect: saved ${response.organization.name}`),
      ],
    },
    afterEffects: [
      ({ response }) =>
        appendActivity(`Form effect: reconciled ${response.organization.id}`),
    ],
  })

  return (
    <WorkspaceLayout
      title="Organization Form"
      description="Create an account record with controlled sector, status, and regional ownership."
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
