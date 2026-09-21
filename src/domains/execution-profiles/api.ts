import { store } from "../shared/store";

export const getExecutionProfile = (id: string) => store.getProfile(id);
export const updateExecutionProfile = (
  id: string,
  input: Parameters<typeof store.updateProfile>[1],
) => store.updateProfile(id, input);
