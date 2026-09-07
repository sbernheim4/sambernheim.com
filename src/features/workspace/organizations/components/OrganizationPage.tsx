import { useOrganizationWorkspace } from "../hooks/useOrganizationWorkspace";
import { Workspace } from "../../components/Workspace";
import { QueryState } from "../../components/QueryState";
import { EntityList } from "../../components/EntityList";
import { Details } from "../../components/Details";
import { OrganizationWorkspaceForm } from "./OrganizationWorkspaceForm";
import { ProjectForm } from "../../projects/components/ProjectForm";
import { Link, useNavigate } from "@tanstack/react-router";

export const OrganizationPage = ({
  id,
  isEditing = false,
}: {
  id: string;
  isEditing?: boolean;
}) => {
  const query = useOrganizationWorkspace(id);
  const navigate = useNavigate({ from: "/organizations/$organizationId" });
  const { organization, projects, tasks } = query;

  return (
    <Workspace
      title={organization?.name ?? "Organization"}
      description="Account details and projects."
      entity="organization"
      organization={organization}
    >
      <QueryState query={query} missing={!organization}>
        {organization && (
          <div className="workspace-columns">
            {isEditing ? (
              <OrganizationWorkspaceForm
                organizationId={organization.id}
                onDiscard={() => {
                  void navigate({
                    search: (previous) => {
                      return { ...previous, isEditing: false };
                    },
                  });
                }}
              />
            ) : (
              <Details
                title="Organization details"
                id={organization.id}
                updatedAt={organization.updatedAt}
              >
                <dl className="resource-details-list">
                  <dt>Name</dt>
                  <dd>{organization.name}</dd>
                  <dt>Sector</dt>
                  <dd>{organization.sector}</dd>
                  <dt>Status</dt>
                  <dd>{organization.status}</dd>
                  <dt>Region</dt>
                  <dd>{organization.region}</dd>
                </dl>
                <Link
                  className="workspace-button"
                  to="/organizations/$organizationId"
                  params={{ organizationId: organization.id }}
                  search={{ isEditing: true }}
                >
                  Edit organization
                </Link>
              </Details>
            )}
            <EntityList
              title="Projects"
              kind="projects"
              tasks={tasks}
              items={projects}
              create={
                isEditing
                  ? (close) => {
                      return <ProjectForm organizationId={organization.id} onCreated={close} />;
                    }
                  : undefined
              }
            />
          </div>
        )}
      </QueryState>
    </Workspace>
  );
};
