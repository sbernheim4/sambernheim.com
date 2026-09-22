import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useComposableForm } from "../../../forms/hooks/useComposableForm";
import { useFormOrchestrator } from "../../../forms/hooks/useFormOrchestrator";
import { useExecutionProfileCreateForm } from "../../execution-profiles/hooks/useExecutionProfileCreateForm";
import { emptyThread, type ThreadFormValues } from "../../shared/types";
import { threadKeys, useCreateThread } from "./useThreads";

const numberValue = (input: string, fallback: number) => {
  return Number(input) || fallback;
};

export const useThreadCreateForms = () => {
  const navigate = useNavigate();
  const progressDelayRef = useRef(0);
  const threadId = useRef(`thread-draft-${Date.now()}`).current;
  const profile = useExecutionProfileCreateForm();
  const create = useCreateThread();

  const entityForm = useComposableForm({
    id: "thread",
    defaultValues: { ...emptyThread, id: threadId, priority: String(emptyThread.priority) },
    dependencies: [profile.form] as const,
    endpoint: {
      mutationFn: async (input: ThreadFormValues) => {
        const { id, priority, ...thread } = input;
        return create.mutateAsync({ ...thread, id, priority: numberValue(priority, 3) });
      },
    },
    invalidateQueryKeys: [threadKeys.all],
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
      return navigate({ to: "/form-demo/threads/$threadId", params: { threadId }, search: {} });
    },
    onProgressClose: () => {
      return navigate({ to: "/form-demo/threads/$threadId", params: { threadId }, search: {} });
    },
  });
  progressDelayRef.current = save.orchestratorProgress.progressDelayMs;

  return { entityForm, profileForm: profile.form, save };
};
