import { store } from "../shared/store";

export const listProcesses = (taskId?: string) => store.listProcesses(taskId);
export const getProcess = (id: string) => store.getProcess(id);
export const updateProcess = (id: string, input: Parameters<typeof store.updateProcess>[1]) =>
  store.updateProcess(id, input);
