import { useNavigate } from "@tanstack/react-router";
import { useComposableForm } from "../../../forms/hooks/useComposableForm";
import { useFormOrchestrator } from "../../../forms/hooks/useFormOrchestrator";
import { useExecutionProfileEditForm } from "../../execution-profiles/hooks/useExecutionProfileEditForm";
import { emptyThread, type ThreadFormValues } from "../../shared/runtimeTypes";
import { threadKeys, useThread, useUpdateThread } from "./useThreads";

const numberValue = (input: string, fallback: number) => {
  return Number(input) || fallback;
};

export const useThreadEditForms = (id: string) => {
  const navigate = useNavigate();

  const query = useThread(id);

  const profileId = query.data?.executionProfileId ?? "";

  const profile = useExecutionProfileEditForm(profileId);

  const update = useUpdateThread();

  const entityForm = useComposableForm({
    id: "thread",
    defaultValues: query.data
      ? { ...query.data, priority: String(query.data.priority) }
      : { ...emptyThread, priority: String(emptyThread.priority) },
    query,
    toFormData: (data): ThreadFormValues => {
      return { ...data, priority: String(data.priority) };
    },
    dependencies: [profile.form] as const,
    endpoint: {
      mutationFn: async (input: ThreadFormValues) => {
        const { id: threadId, priority, ...thread } = input;

        return update.mutateAsync({
          id: threadId,
          input: { ...thread, priority: numberValue(priority, 3) },
        });
      },
    },
    invalidateQueryKeys: [threadKeys.all],
    cacheUpdates: [
      {
        queryKey: ({ response }) => {
          return threadKeys.detail(response.id);
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
      return navigate({ to: "/form-demo/threads/$threadId", params: { threadId: id }, search: {} });
    },
  });

  return { entityForm, profileForm: profile.form, save };
};
