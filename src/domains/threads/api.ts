import { store } from "../shared/store";

export const listThreads = (processId?: string) => {
  return store.listThreads(processId);
};
export const getThread = (id: string) => {
  return store.getThread(id);
};
export const updateThread = (id: string, input: Parameters<typeof store.updateThread>[1]) => {
  return store.updateThread(id, input);
};
