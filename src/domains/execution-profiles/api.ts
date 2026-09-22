import { store } from "../shared/store";

export const createExecutionProfile = (input: Parameters<typeof store.createProfile>[0]) => {
  return store.createProfile(input);
};

export const getExecutionProfile = (id: string) => {
  return store.getProfile(id);
};
export const updateExecutionProfile = (
  id: string,
  input: Parameters<typeof store.updateProfile>[1],
) => {
  return store.updateProfile(id, input);
};
