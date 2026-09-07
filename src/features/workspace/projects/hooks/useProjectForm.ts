import { projectsKey, projectKey, organizationProjectsKey } from "../queryOptions";
import { bootstrapKey } from "../../queryOptions";
import { useQueryBackedForm } from "../../../../forms/hooks/useQueryBackedForm";
import type { OutcomeCallbacks } from "../../../../forms/orchestration/types";
import type { Project, SaveProjectInput, SaveProjectResponse } from "../../types";
import { phaseOptions, priorityOptions } from "../fieldOptions";
import { option } from "../../formOptions";
import { useCreateProject, useUpdateProject } from "./mutations";
import { useProject } from "./queries";
export type ProjectFormValues = Pick<Project, "name" | "priority" | "phase" | "budget">;

const defaultValues: ProjectFormValues = {
  name: "",
  priority: "medium",
  phase: "planning",
  budget: "$50k",
};
export const useProjectForm = ({
  resource,
  organizationId,
  ...callbacks
}: {
  resource?: Project;
  organizationId: string;
} & OutcomeCallbacks<
  ProjectFormValues,
  Omit<SaveProjectInput, "organizationId">,
  SaveProjectResponse
>) => {
  const query = useProject(resource?.id ?? "");
  const create = useCreateProject();
  const update = useUpdateProject(resource?.id ?? "");
  const form = useQueryBackedForm({
    query: resource ? query : undefined,
    defaultValues,
    toFormData: (data: Project): ProjectFormValues => {
      return {
        name: data.name,
        priority: data.priority,
        phase: data.phase,
        budget: data.budget,
      };
    },
    toMutationPayload: (values): SaveProjectInput => {
      return {
        organizationId,
        name: values.name.trim(),
        priority: option(values.priority, priorityOptions),
        phase: option(values.phase, phaseOptions),
        budget: values.budget,
      };
    },
    validate: (values) => {
      return !values.name?.trim() ? "Project name is required." : undefined;
    },
    endpoint: {
      mutationFn: resource ? update.mutateAsync : create.mutateAsync,
      retrySafe: !!resource,
    },
    invalidateQueryKeys: [
      projectsKey(),
      organizationProjectsKey(organizationId),
      ...(resource ? [projectKey(resource.id)] : []),
      bootstrapKey(),
    ],
    ...callbacks,
  });
  return form;
};
