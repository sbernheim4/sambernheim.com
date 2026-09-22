import { store } from "../shared/store";

export const createProcess = (input: Parameters<typeof store.createProcess>[0]) => {
  return store.createProcess(input);
};

export const listProcesses = (taskId?: string) => {
  return store.listProcesses(taskId);
};
export const getProcess = (id: string) => {
  return store.getProcess(id);
};
export const updateProcess = (id: string, input: Parameters<typeof store.updateProcess>[1]) => {
  return store.updateProcess(id, input);
};
