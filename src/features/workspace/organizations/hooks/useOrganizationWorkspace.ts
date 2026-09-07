import { composeQueryState } from "../../queryState";
import { useOrganization } from "./queries";
import { useOrganizationProjects } from "../../projects/hooks/queries";
import { useTasks } from "../../tasks/hooks/queries";
export const useOrganizationWorkspace = (id: string) => {
  const organization = useOrganization(id);
  const projects = useOrganizationProjects(id);
  const tasks = useTasks();
  return {
    organization: organization.data,
    projects: projects.data ?? [],
    tasks: tasks.data ?? [],
    ...composeQueryState([organization, projects, tasks]),
  };
};
