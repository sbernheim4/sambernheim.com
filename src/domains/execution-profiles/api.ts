import { store } from "../shared/store";

export const getExecutionProfile = (id: string) => {
  return store.getProfile(id);
};
export const updateExecutionProfile = (
  id: string,
  input: Parameters<typeof store.updateProfile>[1],
) => {
  return store.updateProfile(id, input);
};
