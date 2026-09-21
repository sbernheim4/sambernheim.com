import { runtimeStore } from "../shared/runtimeStore";
export const listThreads = (processId?: string) => runtimeStore.listThreads(processId);
export const getThread = (id: string) => runtimeStore.getThread(id);
export const updateThread = (id: string, input: Parameters<typeof runtimeStore.updateThread>[1]) =>
  runtimeStore.updateThread(id, input);
