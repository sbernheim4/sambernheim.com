import { composeQueryState } from "../../queryState";
import { useTask } from "./queries";
import { useProject } from "../../projects/hooks/queries";
import { useOrganization } from "../../organizations/hooks/queries";
export const useTaskWorkspace = (id: string) => {
  const task = useTask(id);
  const project = useProject(task.data?.projectId ?? "");
  const organization = useOrganization(task.data?.organizationId ?? "");
  return {
    task: task.data,
    project: project.data,
    organization: organization.data,
    ...composeQueryState(task.data ? [task, project, organization] : [task]),
  };
};
