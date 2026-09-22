import { useComposableForm } from "../../../forms/hooks/useComposableForm";
import { emptyExecutionProfile, type ExecutionProfileFormValues } from "../../shared/types";
import { profileKeys, useCreateExecutionProfile } from "./useExecutionProfile";

export const useExecutionProfileCreateForm = () => {
  const create = useCreateExecutionProfile();

  const form = useComposableForm({
    id: "profile",
    defaultValues: {
      ...emptyExecutionProfile,
      timeoutMs: String(emptyExecutionProfile.timeoutMs),
      memoryLimitMb: String(emptyExecutionProfile.memoryLimitMb),
    },
    endpoint: {
      mutationFn: async (input: ExecutionProfileFormValues) => {
        const { id: _id, timeoutMs, memoryLimitMb, ...profile } = input;
        return create.mutateAsync({
          ...profile,
          timeoutMs: Number(timeoutMs),
          memoryLimitMb: Number(memoryLimitMb),
        });
      },
    },
    invalidateQueryKeys: [profileKeys.all],
  });

  return { form };
};
