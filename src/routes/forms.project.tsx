import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { ActivityPanel, createActivity } from '../features/form-demos/ActivityPanel'
import { WorkspaceLayout } from '../features/workspace/components/WorkspaceLayout'
import { ResourceDataPanel } from '../features/workspace/components/ResourceDataPanel'
import { fetchBootstrap, saveProject } from '../features/workspace/api'
import { bootstrapKey } from '../features/workspace/queries'
import { upsertBootstrap } from '../features/workspace/cache'
import {
  budgetOptions,
  phaseOptions,
  priorityOptions,
} from '../features/workspace/fieldOptions'
import { useQueryBackedForm } from '../forms/bindings/useQueryBackedForm'

export const Route = createFileRoute('/forms/project')({
  ssr: false,
  component: ProjectFormRoute,
})

function ProjectFormRoute() {
  const [activity, setActivity] = useState<
    Array<ReturnType<typeof createActivity>>
  >([])
  const bootstrap = useQuery({
    queryKey: bootstrapKey,
    queryFn: fetchBootstrap,
  })
  const firstOrganizationId = bootstrap.data?.organizations[0]?.id ?? ''

  const appendActivity = (text: string) => {
    setActivity((items) => [createActivity(text), ...items])
  }

  const projectForm = useQueryBackedForm({
    defaultValues: {
      organizationId: firstOrganizationId,
      name: 'Patient Intake',
      priority: 'high' as const,
      phase: 'implementation' as const,
      budget: '$125k',
    },
    endpoint: {
      mutationKey: ['forms-example', 'save-project'],
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
      afterEffects: [
        ({ response }) =>
          appendActivity(`Endpoint effect: saved ${response.project.name}`),
      ],
    },
    afterEffects: [
      ({ response }) =>
        appendActivity(`Form effect: reconciled ${response.project.id}`),
    ],
  })

  useEffect(() => {
    if (!firstOrganizationId) {
      projectForm.form.setFieldValue('organizationId', '')
      return
    }
    if (!projectForm.form.state.values.organizationId && firstOrganizationId) {
      projectForm.form.setFieldValue('organizationId', firstOrganizationId)
    }
  }, [firstOrganizationId, projectForm.form])

  return (
    <WorkspaceLayout
      title="Project Form"
      description="Plan a project resource with priority, lifecycle phase, and budget metadata."
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
              <field.TextField label="Project name" placeholder="Patient Intake" />
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
