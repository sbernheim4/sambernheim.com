import { createFileRoute, Link } from "@tanstack/react-router";

import { useOrganizations } from "../features/workspace/hooks/useWorkspaceResources";
import { WorkspaceLayout } from "../features/workspace/components/WorkspaceLayout";

export const Route = createFileRoute("/forms/")({
  ssr: false,
  component: FormsIndex,
});

function FormsIndex() {
  const organizations = useOrganizations();
  const firstOrganization = organizations.data?.[0];
  return (
    <WorkspaceLayout
      title="Query-Backed Form Examples"
      description="The remaining routes show the organization page with embedded editing and the dependent create flow."
    >
      <section className="home-routes forms-index-routes" aria-label="Form routes">
        <Link to="/organizations" className="route-card">
          <span>Organization Workspace</span>
          <p>Manage organizations, their projects, and assigned tasks.</p>
        </Link>
        {firstOrganization && (
          <Link
            to="/organizations/$organizationId"
            params={{ organizationId: firstOrganization.id }}
            className="route-card"
          >
            <span>Organization Page</span>
            <p>Details, projects, and embedded Profile and Operations editing.</p>
          </Link>
        )}
        <Link to="/forms/flow" className="route-card">
          <span>Dependent Flow</span>
          <p>Saves organization, project, and task in sequence.</p>
        </Link>
      </section>
    </WorkspaceLayout>
  );
}
