import { runtimeStore } from "../shared/runtimeStore";
export const getExecutionProfile = (id: string) => runtimeStore.getProfile(id);
export const updateExecutionProfile = (
  id: string,
  input: Parameters<typeof runtimeStore.updateProfile>[1],
) => runtimeStore.updateProfile(id, input);
