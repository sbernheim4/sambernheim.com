import { tasksKey, taskKey, projectTasksKey } from "../queryOptions";
import { bootstrapKey } from "../../queryOptions";
import { useQueryBackedForm } from "../../../../forms/hooks/useQueryBackedForm";
import type { OutcomeCallbacks } from "../../../../forms/orchestration/types";
import type { Project, SaveTaskInput, SaveTaskResponse, Task } from "../../types";
import { useCreateTask, useUpdateTask } from "./mutations";
import { useTask } from "./queries";
export type TaskFormValues = Pick<Task, "title" | "owner" | "status" | "dueWindow">;

const defaultValues: TaskFormValues = {
  title: "",
  owner: "alex",
  status: "todo",
  dueWindow: "this-week",
};
export const useTaskForm = ({
  resource,
  project,
  ...callbacks
}: {
  resource?: Task;
  project: Project;
} & OutcomeCallbacks<
  TaskFormValues,
  Omit<SaveTaskInput, "organizationId" | "projectId">,
  SaveTaskResponse
>) => {
  const query = useTask(resource?.id ?? "");
  const create = useCreateTask();
  const update = useUpdateTask(resource?.id ?? "");
  const form = useQueryBackedForm({
    query: resource ? query : undefined,
    defaultValues,
    toFormData: (data: Task): TaskFormValues => {
      return {
        title: data.title,
        owner: data.owner,
        status: data.status,
        dueWindow: data.dueWindow,
      };
    },
    toMutationPayload: (values): SaveTaskInput => {
      return {
        organizationId: project.organizationId,
        projectId: project.id,
        title: values.title.trim(),
        owner: values.owner,
        status: values.status,
        dueWindow: values.dueWindow,
      };
    },
    validate: (values) => {
      return !values.title?.trim() ? "Task title is required." : undefined;
    },
    endpoint: {
      mutationFn: resource ? update.mutateAsync : create.mutateAsync,
      retrySafe: !!resource,
    },
    invalidateQueryKeys: [
      tasksKey(),
      projectTasksKey(project.id),
      ...(resource ? [taskKey(resource.id)] : []),
      bootstrapKey(),
    ],
    ...callbacks,
  });
  return form;
};
