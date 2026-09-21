import { store } from "../shared/store";

export const listThreads = (processId?: string) => store.listThreads(processId);
export const getThread = (id: string) => store.getThread(id);
export const updateThread = (id: string, input: Parameters<typeof store.updateThread>[1]) =>
  store.updateThread(id, input);
