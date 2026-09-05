import { createFileRoute, Link } from '@tanstack/react-router'

import { WorkspaceLayout } from '../features/workspace/components/WorkspaceLayout'

export const Route = createFileRoute('/forms/')({
  ssr: false,
  component: FormsIndex,
})

function FormsIndex() {
  return (
    <WorkspaceLayout
      title="Query-Backed Form Examples"
      description="Each route owns one form and renders the resource data from TanStack Query."
    >
      <section className="home-routes forms-index-routes" aria-label="Form routes">
        <Link to="/organizations" className="route-card">
          <span>Organization Workspace</span>
          <p>Manage organizations, their projects, and assigned tasks.</p>
        </Link>
        <Link to="/forms/organization" className="route-card">
          <span>Organization Form</span>
          <p>Single endpoint save with response-backed cache reconciliation.</p>
        </Link>
        <Link to="/forms/project" className="route-card">
          <span>Project Form</span>
          <p>Creates a project under an existing organization.</p>
        </Link>
        <Link to="/forms/task" className="route-card">
          <span>Task Form</span>
          <p>Creates a task under an existing project and organization.</p>
        </Link>
        <Link to="/forms/flow" className="route-card">
          <span>Dependent Flow</span>
          <p>Saves organization, project, and task in sequence.</p>
        </Link>
      </section>
    </WorkspaceLayout>
  )
}
