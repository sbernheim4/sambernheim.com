import { useNavigate } from "@tanstack/react-router";
import { useComposableForm } from "../../../forms/hooks/useComposableForm";
import { useFormOrchestrator } from "../../../forms/hooks/useFormOrchestrator";
import { useExecutionProfileEditForm } from "../../execution-profiles/hooks/useExecutionProfileEditForm";
import { emptyTask, type TaskFormValues } from "../../shared/runtimeTypes";
import { taskKeys, useTask, useUpdateTask } from "./useTasks";

const numberValue = (input: string, fallback: number) => {

  return Number(input) || fallback;
};

export const useTaskEditForms = (id: string) => {
  const navigate = useNavigate();

  const query = useTask(id);

  const profileId = query.data?.executionProfileId ?? "";

  const profile = useExecutionProfileEditForm(profileId);

  const update = useUpdateTask();

  const entityForm = useComposableForm({
    id: "task",
    defaultValues: { ...emptyTask, priority: String(emptyTask.priority) } satisfies TaskFormValues,
    query,
    toFormData: (data): TaskFormValues => {
      return { ...data, priority: String(data.priority) };
    },
    dependencies: [profile.form] as const,
    endpoint: {
      mutationFn: async (input: TaskFormValues) => {
        const { id: taskId, priority, ...task } = input;

        return update.mutateAsync({
          id: taskId,
          input: { ...task, priority: numberValue(priority, 3) },
        });
      },
    },
    invalidateQueryKeys: [taskKeys.all],
    cacheUpdates: [
      {
        queryKey: ({ response }) => {
          return taskKeys.detail(response.id);
        },
      },
    ],
    toMutationPayload: (input, context) => {
      return {
        ...input,
        executionProfileId: context.results.profile?.id ?? input.executionProfileId,
      };
    },
  });

  const save = useFormOrchestrator({
    forms: [profile.form, entityForm] as const,
    onSuccess: () => {
      return navigate({ to: "/tasks/$taskId", params: { taskId: id }, search: {} });
    },
  });

  return { entityForm, profileForm: profile.form, save };
};
