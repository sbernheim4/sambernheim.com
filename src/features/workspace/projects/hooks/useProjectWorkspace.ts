import { composeQueryState } from "../../queryState";
import { useProject } from "./queries";
import { useOrganization } from "../../organizations/hooks/queries";
import { useProjectTasks } from "../../tasks/hooks/queries";
export const useProjectWorkspace = (id: string) => {
  const project = useProject(id);
  const organization = useOrganization(project.data?.organizationId ?? "");
  const tasks = useProjectTasks(id);
  return {
    project: project.data,
    organization: organization.data,
    tasks: tasks.data ?? [],
    ...composeQueryState(project.data ? [project, organization, tasks] : [project]),
  };
};
