import { useComposableForm } from "../../../forms/hooks/useComposableForm";
import { useFormOrchestrator } from "../../../forms/hooks/useFormOrchestrator";
import { organizationCacheUpdates, projectCacheUpdates, taskCacheUpdates } from "../cachePolicies";
import { useCreateOrganization } from "../organizations/hooks/mutations";
import { useCreateProject } from "../projects/hooks/mutations";
import { workspaceKeys } from "../queries";
import { useCreateTask } from "../tasks/hooks/mutations";
import type { SaveOrganizationInput, SaveProjectInput, SaveTaskInput } from "../types";
import { useWorkspaceResources } from "./useWorkspaceResources";

const organizationDefaults: SaveOrganizationInput = {
  name: "Acme Health",
  sector: "healthcare",
  region: "east",
  status: "active",
};
const projectDefaults: Omit<SaveProjectInput, "organizationId"> = {
  name: "Patient Intake",
  priority: "high",
  phase: "planning",
  budget: "$125k",
};
const taskDefaults: Omit<SaveTaskInput, "organizationId" | "projectId"> = {
  title: "Provision workspace",
  owner: "alex",
  status: "todo",
  dueWindow: "this-week",
};

export function useWorkspaceLaunchForms(appendActivity: (text: string) => void) {
  const createOrganization = useCreateOrganization();
  const createProject = useCreateProject();
  const createTask = useCreateTask();
  const bootstrap = useWorkspaceResources();

  const organization = useComposableForm({
    id: "organization",
    defaultValues: organizationDefaults,
    endpoint: {
      mutationFn: createOrganization.mutateAsync,
    },
    cacheUpdates: organizationCacheUpdates(),
    onSuccess: ({ response }) =>
      appendActivity(`Saved organization: ${response.organization.name}`),
  });
  const project = useComposableForm({
    id: "project",
    defaultValues: projectDefaults,
    dependencies: [organization] as const,
    toMutationPayload: (values, { results }) => {
      if (!results.organization) throw new Error("Organization has not been saved.");
      return { ...values, organizationId: results.organization.organization.id };
    },
    endpoint: {
      mutationFn: createProject.mutateAsync,
    },
    cacheUpdates: projectCacheUpdates(),
    onSuccess: ({ response }) => appendActivity(`Saved project: ${response.project.name}`),
  });
  const task = useComposableForm({
    id: "task",
    defaultValues: taskDefaults,
    dependencies: [organization, project] as const,
    toMutationPayload: (values, { results }) => {
      if (!results.organization || !results.project)
        throw new Error("Organization and project have not been saved.");
      return {
        ...values,
        organizationId: results.organization.organization.id,
        projectId: results.project.project.id,
      };
    },
    endpoint: {
      mutationFn: createTask.mutateAsync,
    },
    cacheUpdates: taskCacheUpdates(),
    onSuccess: ({ response }) => appendActivity(`Saved task: ${response.task.title}`),
  });
  const save = useFormOrchestrator({
    forms: [organization, project, task] as const,
    includePristine: true,
    invalidateQueryKeys: [workspaceKeys.all],
    onSuccess: ({ result }) =>
      appendActivity(`Workspace created: ${result.responses.organization?.organization.name}`),
    onFailure: () => appendActivity("Workspace creation failed. See the save results."),
  });

  return { organization, project, task, save, bootstrap };
}
