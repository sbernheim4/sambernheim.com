import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useFormOrchestrator } from '../../../forms/query/useFormOrchestrator'
import {
  useOrganizationProfileForm,
  useOrganizationOperationsForm,
} from '../hooks/organizationConfigurationForms'
import { useOrganizationWorkspace } from '../hooks/useWorkspaceResources'
import { regionOptions, sectorOptions } from '../fieldOptions'
import { EntityList, QueryState, Workspace } from './WorkspacePages'
import { ProjectEditor } from './ResourceEditors'

export function OrganizationConfiguration({ id }: { id: string }) {
  const query = useOrganizationWorkspace(id)
  const organization = query.data.organizations[0]
  return (
    <Workspace
      title="Organization configuration"
      description="Edit the profile and operations together."
      entity="organization"
      organization={organization}
    >
      <QueryState query={query}>
        {organization && (
          <>
            <p>
              <Link
                to="/organizations/$organizationId"
                params={{ organizationId: id }}
              >
                {organization.name}
              </Link>{' '}
              / Configuration
            </p>
            <ConfigurationForm key={id} organizationId={id} />
            <EntityList
              title="Projects"
              kind="projects"
              data={query.data}
              items={query.data.projects}
              create={(close) => (
                <ProjectEditor organizationId={id} onCreated={close} />
              )}
            />
          </>
        )}
      </QueryState>
    </Workspace>
  )
}

function ConfigurationForm({ organizationId }: { organizationId: string }) {
  const profile = useOrganizationProfileForm({ organizationId })
  const operations = useOrganizationOperationsForm({ organizationId })
  const save = useFormOrchestrator({
    forms: [profile.participant, operations.participant],
    retry: { maxRetries: 1, delayMs: 500 },
  })
  const [submitError, setSubmitError] = useState<unknown>()
  const ready = profile.isReady && operations.isReady
  const readError = profile.readError || operations.readError
  return (
    <form
      className="resource-editor configuration-form"
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitError(undefined)
        void save.submit().catch(setSubmitError)
      }}
    >
      {readError ? (
        <p className="form-error" role="alert">
          Unable to load configuration.{' '}
          <button
            type="button"
            onClick={() => {
              void profile.retryRead()
              void operations.retryRead()
            }}
          >
            Retry
          </button>
        </p>
      ) : (
        !ready && <p role="status">Loading configuration...</p>
      )}
      <fieldset disabled={save.isSaving || !ready} className="editor-fields">
        <section className="workspace-details">
          <h2>Profile</h2>
          <ProfileFields form={profile.form} />
        </section>
        <section className="workspace-details">
          <h2>Operations</h2>
          <OperationsFields form={operations.form} />
        </section>
        <button className="primary-action" type="submit">
          {save.isSaving ? 'Saving changes...' : 'Save all changes'}
        </button>
      </fieldset>
      {save.phase !== 'idle' && (
        <div role="status" aria-live="polite">
          <p>
            {save.isSaving
              ? `Save progress: ${save.phase}`
              : outcomeMessage(save.result?.outcome)}
          </p>
          <ul>
            {(['profile', 'operations'] as const).map((id) => {
              const state = save.participants?.[id]
              return (
                <li key={id}>
                  {id === 'profile' ? 'Profile' : 'Operations'}:{' '}
                  {state?.status ?? 'pending'}
                  {state?.attempts
                    ? ` (${state.attempts} ${state.attempts === 1 ? 'attempt' : 'attempts'})`
                    : ''}
                  {state?.failure && (
                    <span className="form-error">
                      {' '}
                      — {String(state.failure.error)}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
      {!!submitError && (
        <p className="form-error" role="alert">
          {String(submitError)}
        </p>
      )}
    </form>
  )
}
function ProfileFields({
  form,
}: {
  form: ReturnType<typeof useOrganizationProfileForm>['form']
}) {
  return (
    <>
      <form.AppField
        name="displayName"
        validators={{
          onSubmit: ({ value }) =>
            !value.trim() ? 'Name is required.' : undefined,
        }}
      >
        {(field) => <field.TextField label="Name" required />}
      </form.AppField>
      <form.AppField name="selectedSector">
        {(field) => (
          <field.SelectField label="Sector" options={sectorOptions} />
        )}
      </form.AppField>
    </>
  )
}
function OperationsFields({
  form,
}: {
  form: ReturnType<typeof useOrganizationOperationsForm>['form']
}) {
  return (
    <>
      <form.AppField name="isActive">
        {(field) => (
          <fieldset className="app-radio-group">
            <legend>Status</legend>
            <label>
              <input
                type="radio"
                name="operations-status"
                checked={field.state.value === true}
                onChange={() => field.handleChange(true)}
                onBlur={field.handleBlur}
              />{' '}
              Active
            </label>
            <label>
              <input
                type="radio"
                name="operations-status"
                checked={field.state.value === false}
                onChange={() => field.handleChange(false)}
                onBlur={field.handleBlur}
              />{' '}
              Paused
            </label>
          </fieldset>
        )}
      </form.AppField>
      <form.AppField name="region">
        {(field) => (
          <field.SelectField label="Region" options={regionOptions} />
        )}
      </form.AppField>
    </>
  )
}
function outcomeMessage(outcome?: string) {
  if (outcome === 'success') return 'All changes saved.'
  if (outcome === 'saved-with-follow-up-errors')
    return 'All changes saved, but a follow-up action failed. The saved changes do not need to be submitted again.'
  if (outcome === 'partial-failure')
    return 'The save stopped. Saved sections remain persisted; failed and skipped sections retain their edits.'
  return 'Please correct the form errors. No changes were saved.'
}
