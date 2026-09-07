import { composeQueryState } from "../../queryState";
import { useOrganizations } from "./queries";
import { useProjects } from "../../projects/hooks/queries";
export const useOrganizationsWorkspace = () => {
  const organizations = useOrganizations();
  const projects = useProjects();
  return {
    organizations: organizations.data ?? [],
    projects: projects.data ?? [],
    ...composeQueryState([organizations, projects]),
  };
};
