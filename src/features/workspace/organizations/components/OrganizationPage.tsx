import { useOrganizationWorkspace } from "../hooks/useOrganizationWorkspace";
import { Workspace } from "../../components/Workspace";
import { QueryState } from "../../components/QueryState";
import { EntityList } from "../../components/EntityList";
import { Details } from "../../components/Details";
import { OrganizationWorkspaceForm } from "./OrganizationWorkspaceForm";
import { ProjectForm } from "../../projects/components/ProjectForm";

export const OrganizationPage = ({ id }: { id: string }) => {
  const query = useOrganizationWorkspace(id);
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
            <Details
              title="Organization details"
              id={organization.id}
              updatedAt={organization.updatedAt}
            >
              <p className="workspace-edit-hint">
                Organization details are composed from the Profile and Operations records below.
              </p>
            </Details>
            <OrganizationWorkspaceForm organizationId={organization.id} />
            <EntityList
              title="Projects"
              kind="projects"
              tasks={tasks}
              items={projects}
              create={(close) => {
                return <ProjectForm organizationId={organization.id} onCreated={close} />;
              }}
            />
          </div>
        )}
      </QueryState>
    </Workspace>
  );
};
