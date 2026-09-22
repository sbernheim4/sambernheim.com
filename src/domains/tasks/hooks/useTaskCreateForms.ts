import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useComposableForm } from "../../../forms/hooks/useComposableForm";
import { useFormOrchestrator } from "../../../forms/hooks/useFormOrchestrator";
import { useExecutionProfileCreateForm } from "../../execution-profiles/hooks/useExecutionProfileCreateForm";
import { emptyTask, type TaskFormValues } from "../../shared/types";
import { taskKeys, useCreateTask } from "./useTasks";

export const useTaskCreateForms = () => {
  const navigate = useNavigate();
  const progressDelayRef = useRef(0);
  const taskId = useRef(`task-draft-${Date.now()}`).current;
  const profile = useExecutionProfileCreateForm();
  const create = useCreateTask();

  const entityForm = useComposableForm({
    id: "task",
    defaultValues: { ...emptyTask, id: taskId, priority: String(emptyTask.priority) },
    dependencies: [profile.form] as const,
    endpoint: {
      mutationFn: async (input: TaskFormValues) => {
        const { id, priority, ...task } = input;
        return create.mutateAsync({ ...task, id, priority: Number(priority) || 3 });
      },
    },
    invalidateQueryKeys: [taskKeys.all],
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
      if (progressDelayRef.current > 0) return;
      return navigate({ to: "/form-demo/tasks/$taskId", params: { taskId }, search: {} });
    },
    onProgressClose: () => {
      return navigate({ to: "/form-demo/tasks/$taskId", params: { taskId }, search: {} });
    },
  });
  progressDelayRef.current = save.orchestratorProgress.progressDelayMs;

  return { entityForm, profileForm: profile.form, save };
};
