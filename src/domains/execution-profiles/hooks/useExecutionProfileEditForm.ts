import { useComposableForm } from "../../../forms/hooks/useComposableForm";
import { emptyExecutionProfile, type ExecutionProfileFormValues } from "../../shared/types";
import { profileKeys, useExecutionProfile, useUpdateExecutionProfile } from "./useExecutionProfile";

export const useExecutionProfileEditForm = (profileId: string) => {
  const query = useExecutionProfile(profileId);

  const update = useUpdateExecutionProfile();

  const form = useComposableForm({
    id: "profile",
    defaultValues: query.data
      ? {
          ...query.data,
          timeoutMs: String(query.data.timeoutMs),
          memoryLimitMb: String(query.data.memoryLimitMb),
        }
      : {
          ...emptyExecutionProfile,
          timeoutMs: String(emptyExecutionProfile.timeoutMs),
          memoryLimitMb: String(emptyExecutionProfile.memoryLimitMb),
        },
    query,
    toFormData: (data): ExecutionProfileFormValues => {
      return {
        ...data,
        timeoutMs: String(data.timeoutMs),
        memoryLimitMb: String(data.memoryLimitMb),
      };
    },
    endpoint: {
      mutationFn: async (input: ExecutionProfileFormValues) => {
        const { id, timeoutMs, memoryLimitMb, ...profile } = input;

        return update.mutateAsync({
          id,
          input: {
            ...profile,
            timeoutMs: Number(timeoutMs),
            memoryLimitMb: Number(memoryLimitMb),
          },
        });
      },
    },
    invalidateQueryKeys: [profileKeys.all],
    cacheUpdates: [
      {
        queryKey: ({ response }) => {
          return profileKeys.detail(response.id);
        },
      },
    ],
  });

  return { query, form };
};
