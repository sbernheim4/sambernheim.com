import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useComposableForm } from "../../../forms/hooks/useComposableForm";
import { useFormOrchestrator } from "../../../forms/hooks/useFormOrchestrator";
import { useExecutionProfileCreateForm } from "../../execution-profiles/hooks/useExecutionProfileCreateForm";
import { emptyProcess } from "../../shared/types";
import { processKeys, useCreateProcess } from "./useProcesses";

export const useProcessCreateForms = () => {
  const navigate = useNavigate();
  const progressDelayRef = useRef(0);
  const processId = useRef(`process-draft-${Date.now()}`).current;
  const profile = useExecutionProfileCreateForm();
  const create = useCreateProcess();

  const entityForm = useComposableForm({
    id: "process",
    defaultValues: { ...emptyProcess, id: processId },
    dependencies: [profile.form] as const,
    endpoint: {
      mutationFn: async (input) => {
        const { id, ...process } = input;
        return create.mutateAsync({ ...process, id });
      },
    },
    invalidateQueryKeys: [processKeys.all],
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
      return navigate({ to: "/form-demo/processes/$processId", params: { processId }, search: {} });
    },
    onProgressClose: () => {
      return navigate({ to: "/form-demo/processes/$processId", params: { processId }, search: {} });
    },
  });
  progressDelayRef.current = save.orchestratorProgress.progressDelayMs;

  return { entityForm, profileForm: profile.form, save };
};
