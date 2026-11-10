import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useComposableForm } from "@/features/Forms/hooks/useComposableForm";
import { useFormOrchestrator } from "@/features/Forms/hooks/useFormOrchestrator";
import { useExecutionProfileEditForm } from "../../ExecutionProfiles/hooks/useExecutionProfileEditForm";
import { emptyTask, type TaskFormValues } from "@/features/Workspace/types";
import { taskKeys, useTask, useUpdateTask } from "./useTasks";

const numberValue = (input: string, fallback: number) => {
  return Number(input) || fallback;
};

export const useTaskEditForms = (id: string) => {
  const navigate = useNavigate();
  const progressDelayRef = useRef(0);

  const query = useTask(id);

  const profileId = query.data?.executionProfileId ?? "";

  const profile = useExecutionProfileEditForm(profileId);

  const update = useUpdateTask();

  const entityForm = useComposableForm({
    id: "task",
    defaultValues: query.data
      ? { ...query.data, priority: String(query.data.priority) }
      : { ...emptyTask, priority: String(emptyTask.priority) },
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
      if (progressDelayRef.current > 0) {
        return;
      }

      return navigate({
        to: "/experiments/workspace/tasks/$taskId",
        params: { taskId: id },
        search: {},
      });
    },
    onProgressClose: () => {
      return navigate({
        to: "/experiments/workspace/tasks/$taskId",
        params: { taskId: id },
        search: {},
      });
    },
  });

  progressDelayRef.current = save.orchestratorProgress.progressDelayMs;

  return { entityForm, profileForm: profile.form, save };
};
