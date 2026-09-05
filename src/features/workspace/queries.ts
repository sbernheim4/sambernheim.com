const root = ['forms-example'] as const
const resourceKeys = (resource: string) => ({
  all: [...root, resource],
  list: () => [...root, resource, 'list'],
  detail: (id: string) => [...root, resource, 'detail', id],
})
export const bootstrapKey = [...root, 'bootstrap'] as const
export const workspaceKeys = {
  all: root,
  organizations: resourceKeys('organizations'),
  projects: { ...resourceKeys('projects'), forOrganization: (id: string) => [...root, 'projects', 'list', id] },
  tasks: { ...resourceKeys('tasks'), forProject: (id: string) => [...root, 'tasks', 'list', id] },
  organizationProfiles: resourceKeys('organization-profiles'),
  organizationOperations: resourceKeys('organization-operations'),
}
