import { useNavigate } from "@tanstack/react-router";
import { useComposableForm } from "../../../forms/hooks/useComposableForm";
import { useFormOrchestrator } from "../../../forms/hooks/useFormOrchestrator";
import { useExecutionProfileEditForm } from "../../execution-profiles/hooks/useExecutionProfileEditForm";
import { emptyProcess } from "../../shared/runtimeTypes";
import { processKeys, useProcess, useUpdateProcess } from "./useProcesses";

export const useProcessEditForms = (id: string) => {
  const navigate = useNavigate();

  const query = useProcess(id);

  const profileId = query.data?.executionProfileId ?? "";

  const profile = useExecutionProfileEditForm(profileId);

  const update = useUpdateProcess();

  const entityForm = useComposableForm({
    id: "process",
    defaultValues: emptyProcess,
    query,
    toFormData: (data) => {
      return data;
    },
    dependencies: [profile.form] as const,
    endpoint: {
      mutationFn: async (input) => {
        const { id: processId, ...process } = input;

        return update.mutateAsync({ id: processId, input: process });
      },
    },
    invalidateQueryKeys: [processKeys.all],
    cacheUpdates: [
      {
        queryKey: ({ response }) => {
          return processKeys.detail(response.id);
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
      return navigate({ to: "/processes/$processId", params: { processId: id }, search: {} });
    },
  });

  return { entityForm, profileForm: profile.form, save };
};
