import type { OutcomeCallbacks } from "../../../forms/orchestration/types";
import { useQueryBackedForm } from "../../../forms/hooks/useQueryBackedForm";
import type {
  Organization,
  Project,
  Task,
  SaveOrganizationInput,
  SaveProjectInput,
  SaveTaskInput,
  SaveOrganizationResponse,
  SaveProjectResponse,
  SaveTaskResponse,
} from "../types";
import { useOrganization, useProject, useTask } from "./useWorkspaceResources";
import {
  useCreateOrganization,
  useCreateProject,
  useCreateTask,
  useUpdateOrganization,
  useUpdateProject,
  useUpdateTask,
} from "./mutations";
import { organizationCacheUpdates, projectCacheUpdates, taskCacheUpdates } from "../cachePolicies";
import { workspaceKeys } from "../queries";
import {
  sectorOptions,
  statusOptions,
  regionOptions,
  priorityOptions,
  phaseOptions,
  budgetOptions,
  ownerOptions,
  taskStatusOptions,
  dueWindowOptions,
} from "../fieldOptions";

export function useOrganizationForm({
  resource,
  ...callbacks
}: { resource?: Organization } & OutcomeCallbacks<
  Record<string, string>,
  SaveOrganizationInput,
  SaveOrganizationResponse
>) {
  const query = useOrganization(resource?.id ?? "");
  const create = useCreateOrganization();
  const update = useUpdateOrganization(resource?.id ?? "");
  const form = useQueryBackedForm({
    query: resource ? query : undefined,
    defaultValues: {
      name: "",
      sector: "healthcare",
      status: "active",
      region: "east",
    } as Record<string, string>,
    toFormData: (data: Organization): Record<string, string> => ({
      name: data.name,
      sector: data.sector,
      status: data.status,
      region: data.region,
    }),
    toMutationPayload: (values): SaveOrganizationInput => ({
      name: values.name.trim(),
      sector: option(values.sector, sectorOptions),
      status: option(values.status, statusOptions),
      region: option(values.region, regionOptions),
    }),
    validate: (values) => (!values.name?.trim() ? "Organization name is required." : undefined),
    endpoint: {
      mutationFn: resource ? update.mutateAsync : create.mutateAsync,
      retrySafe: !!resource,
    },
    invalidateQueryKeys: [workspaceKeys.all],
    cacheUpdates: organizationCacheUpdates(),
    ...callbacks,
  });
  return form;
}
export function useProjectForm({
  resource,
  organizationId,
  ...callbacks
}: { resource?: Project; organizationId: string } & OutcomeCallbacks<
  Record<string, string>,
  Omit<SaveProjectInput, "organizationId">,
  SaveProjectResponse
>) {
  const query = useProject(resource?.id ?? "");
  const create = useCreateProject();
  const update = useUpdateProject(resource?.id ?? "");
  const form = useQueryBackedForm({
    query: resource ? query : undefined,
    defaultValues: {
      name: "",
      priority: "medium",
      phase: "planning",
      budget: "$50k",
    } as Record<string, string>,
    toFormData: (data: Project): Record<string, string> => ({
      name: data.name,
      priority: data.priority,
      phase: data.phase,
      budget: data.budget,
    }),
    toMutationPayload: (values): SaveProjectInput => ({
      organizationId,
      name: values.name.trim(),
      priority: option(values.priority, priorityOptions),
      phase: option(values.phase, phaseOptions),
      budget: values.budget,
    }),
    validate: (values) => (!values.name?.trim() ? "Project name is required." : undefined),
    endpoint: {
      mutationFn: resource ? update.mutateAsync : create.mutateAsync,
      retrySafe: !!resource,
    },
    invalidateQueryKeys: [workspaceKeys.all],
    cacheUpdates: projectCacheUpdates(),
    ...callbacks,
  });
  return form;
}
export function useTaskForm({
  resource,
  project,
  ...callbacks
}: { resource?: Task; project: Project } & OutcomeCallbacks<
  Record<string, string>,
  Omit<SaveTaskInput, "organizationId" | "projectId">,
  SaveTaskResponse
>) {
  const query = useTask(resource?.id ?? "");
  const create = useCreateTask();
  const update = useUpdateTask(resource?.id ?? "");
  const form = useQueryBackedForm({
    query: resource ? query : undefined,
    defaultValues: {
      title: "",
      owner: "alex",
      status: "todo",
      dueWindow: "this-week",
    } as Record<string, string>,
    toFormData: (data: Task): Record<string, string> => ({
      title: data.title,
      owner: data.owner,
      status: data.status,
      dueWindow: data.dueWindow,
    }),
    toMutationPayload: (values): SaveTaskInput => ({
      organizationId: project.organizationId,
      projectId: project.id,
      title: values.title.trim(),
      owner: option(values.owner, ownerOptions),
      status: option(values.status, taskStatusOptions),
      dueWindow: option(values.dueWindow, dueWindowOptions),
    }),
    validate: (values) => (!values.title?.trim() ? "Task title is required." : undefined),
    endpoint: {
      mutationFn: resource ? update.mutateAsync : create.mutateAsync,
      retrySafe: !!resource,
    },
    invalidateQueryKeys: [workspaceKeys.all],
    cacheUpdates: taskCacheUpdates(),
    ...callbacks,
  });
  return form;
}
function option<T extends string>(value: string, options: readonly { value: T }[]): T {
  const match = options.find((item) => item.value === value);
  if (!match) throw new Error("Choose a valid option.");
  return match.value;
}
