import { tasksKey, taskKey, projectTasksKey } from "../queryOptions";
import { bootstrapKey } from "../../queryOptions";
import { useQueryBackedForm } from "../../../../forms/hooks/useQueryBackedForm";
import type { OutcomeCallbacks } from "../../../../forms/orchestration/types";
import type { Project, SaveTaskInput, SaveTaskResponse, Task } from "../../types";
import { dueWindowOptions, ownerOptions, taskStatusOptions } from "../fieldOptions";
import { option } from "../../formOptions";
import { useCreateTask, useUpdateTask } from "./mutations";
import { useTask } from "./queries";
export type TaskFormValues = Pick<Task, "title" | "owner" | "status" | "dueWindow">;

const defaultValues: TaskFormValues = {
  title: "",
  owner: "alex",
  status: "todo",
  dueWindow: "this-week",
};

export function useTaskForm({
  resource,
  project,
  ...callbacks
}: { resource?: Task; project: Project } & OutcomeCallbacks<
  TaskFormValues,
  Omit<SaveTaskInput, "organizationId" | "projectId">,
  SaveTaskResponse
>) {
  const query = useTask(resource?.id ?? "");
  const create = useCreateTask();
  const update = useUpdateTask(resource?.id ?? "");
  const form = useQueryBackedForm({
    query: resource ? query : undefined,
    defaultValues,
    toFormData: (data: Task): TaskFormValues => ({
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
    invalidateQueryKeys: [tasksKey(), projectTasksKey(project.id), ...(resource ? [taskKey(resource.id)] : []), bootstrapKey()],
    ...callbacks,
  });
  return form;
}
