import { useQueryBackedForm } from "../../../../forms/hooks/useQueryBackedForm";
import type { OutcomeCallbacks } from "../../../../forms/orchestration/types";
import { projectCacheUpdates } from "../../cachePolicies";
import { workspaceKeys } from "../../queries";
import type { Project, SaveProjectInput, SaveProjectResponse } from "../../types";
import { phaseOptions, priorityOptions } from "../fieldOptions";
import { option } from "../../formOptions";
import { useCreateProject, useUpdateProject } from "./mutations";
import { useProject } from "./queries";
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
