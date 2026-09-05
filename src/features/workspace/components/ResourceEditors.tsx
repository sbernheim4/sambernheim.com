import { useState } from 'react'
import type { BootstrapData, Organization, Project, Task } from '../types'
import {
  saveOrganization, saveProject, saveTask,
  updateOrganization, updateProject, updateTask,
} from '../api'
import { bootstrapKey } from '../queries'
import { upsertBootstrap } from '../cache'
import {
  sectorOptions, statusOptions, regionOptions, priorityOptions, phaseOptions,
  budgetOptions, ownerOptions, taskStatusOptions, dueWindowOptions,
} from '../fieldOptions'
import { useQueryBackedForm } from '../../../forms/bindings/useQueryBackedForm'

type Option = { value: string; label: string }
type EditorField = {
  name: string
  label: string
  mode?: 'select' | 'radio'
  options?: readonly Option[]
}
type EditorSpec = {
  values: Record<string, string>
  fields: EditorField[]
  save: (values: Record<string, string>) => Promise<Partial<BootstrapData>>
}

export function OrganizationEditor({ resource, onCreated }: {
  resource?: Organization
  onCreated?: () => void
}) {
  return <ResourceEditor key={resource?.id ?? 'new'} creating={!resource} onCreated={onCreated} spec={{
    values: resource ? { name: resource.name, sector: resource.sector, status: resource.status, region: resource.region }
      : { name: '', sector: 'healthcare', status: 'active', region: 'east' },
    fields: [
      { name: 'name', label: 'Organization name' },
      { name: 'sector', label: 'Sector', mode: 'select', options: sectorOptions },
      { name: 'status', label: 'Status', mode: 'radio', options: statusOptions },
      { name: 'region', label: 'Region', mode: 'select', options: regionOptions },
    ],
    save: async (values) => {
      const input = { name: values.name.trim(), sector: option(values.sector, sectorOptions),
        status: option(values.status, statusOptions), region: option(values.region, regionOptions) }
      const response = resource ? await updateOrganization(resource.id, input) : await saveOrganization(input)
      return { organizations: [response.organization] }
    },
  }} />
}

export function ProjectEditor({ resource, organizationId, onCreated }: {
  resource?: Project
  organizationId: string
  onCreated?: () => void
}) {
  return <ResourceEditor key={resource?.id ?? organizationId} creating={!resource} onCreated={onCreated} spec={{
    values: resource ? { name: resource.name, priority: resource.priority, phase: resource.phase, budget: resource.budget }
      : { name: '', priority: 'medium', phase: 'planning', budget: '$50k' },
    fields: [
      { name: 'name', label: 'Project name' },
      { name: 'priority', label: 'Priority', mode: 'radio', options: priorityOptions },
      { name: 'phase', label: 'Phase', mode: 'select', options: phaseOptions },
      { name: 'budget', label: 'Budget', mode: 'select', options: budgetOptions },
    ],
    save: async (values) => {
      const input = { organizationId, name: values.name.trim(), priority: option(values.priority, priorityOptions),
        phase: option(values.phase, phaseOptions), budget: values.budget }
      const response = resource ? await updateProject(resource.id, input) : await saveProject(input)
      return { projects: [response.project] }
    },
  }} />
}

export function TaskEditor({ resource, project, onCreated }: {
  resource?: Task
  project: Project
  onCreated?: () => void
}) {
  return <ResourceEditor key={resource?.id ?? project.id} creating={!resource} onCreated={onCreated} spec={{
    values: resource ? { title: resource.title, owner: resource.owner, status: resource.status, dueWindow: resource.dueWindow }
      : { title: '', owner: 'alex', status: 'todo', dueWindow: 'this-week' },
    fields: [
      { name: 'title', label: 'Task title' },
      { name: 'owner', label: 'Owner', mode: 'select', options: ownerOptions },
      { name: 'status', label: 'Status', mode: 'radio', options: taskStatusOptions },
      { name: 'dueWindow', label: 'Due', mode: 'select', options: dueWindowOptions },
    ],
    save: async (values) => {
      const input = { organizationId: project.organizationId, projectId: project.id,
        title: values.title.trim(), owner: option(values.owner, ownerOptions),
        status: option(values.status, taskStatusOptions), dueWindow: option(values.dueWindow, dueWindowOptions) }
      const response = resource ? await updateTask(resource.id, input) : await saveTask(input)
      return { tasks: [response.task] }
    },
  }} />
}

function ResourceEditor({ spec, creating, onCreated }: {
  spec: EditorSpec
  creating: boolean
  onCreated?: () => void
}) {
  const [saved, setSaved] = useState(false)
  const editor = useQueryBackedForm({
    defaultValues: spec.values,
    endpoint: {
      mutationKey: ['forms-example', 'workspace-save'],
      mutationFn: async (values) => {
        for (const field of spec.fields.filter((field) => !field.mode)) {
          if (!values[field.name]?.trim()) throw new Error(`${field.label} is required.`)
        }
        return spec.save(values)
      },
      refetchPolicy: { refetchQueries: [bootstrapKey] },
      cacheUpdates: [{ queryKey: bootstrapKey, update: (previous, { response }) => upsertBootstrap(previous, response) }],
      afterEffects: [() => { setSaved(true); if (creating) onCreated?.() }],
    },
  })

  return (
    <form className="resource-editor" onChange={() => setSaved(false)} onSubmit={(event) => {
      event.preventDefault()
      setSaved(false)
      void editor.form.handleSubmit().catch(() => {})
    }}>
      <fieldset disabled={editor.isSaving} className="editor-fields">
        {spec.fields.map((item) => (
          <editor.form.AppField key={item.name} name={item.name}>
            {(field) => item.mode === 'radio' ? (
              <field.RadioGroupField label={item.label} options={item.options ?? []} />
            ) : item.mode === 'select' ? (
              <field.SelectField label={item.label} options={item.options ?? []} />
            ) : <field.TextField label={item.label} required />}
          </editor.form.AppField>
        ))}
        <editor.form.SubmitButton label={creating ? 'Create' : 'Save changes'} isSaving={editor.isSaving} />
      </fieldset>
      {editor.error && <p className="form-error" role="alert">{editor.error.message}</p>}
      {saved && <p className="save-feedback" role="status">Changes saved.</p>}
    </form>
  )
}

function option<T extends string>(value: string, options: readonly { value: T }[]): T {
  const match = options.find((item) => item.value === value)
  if (!match) throw new Error('Choose a valid option.')
  return match.value
}
