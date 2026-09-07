import { useOrganizationsWorkspace } from "../hooks/useOrganizationsWorkspace";
import { Workspace } from "../../components/Workspace";
import { QueryState } from "../../components/QueryState";
import { EntityList } from "../../components/EntityList";
import { OrganizationForm } from "./OrganizationForm";

export const OrganizationsPage = () => {
  const query = useOrganizationsWorkspace();

  return (
    <Workspace
      title="Organizations"
      description="Manage your accounts, projects, and day-to-day work."
    >
      <QueryState query={query}>
        <EntityList
          title="All organizations"
          kind="organizations"
          items={query.organizations}
          projects={query.projects}
          create={(close) => {
            return <OrganizationForm onCreated={close} />;
          }}
        />
      </QueryState>
    </Workspace>
  );
};
