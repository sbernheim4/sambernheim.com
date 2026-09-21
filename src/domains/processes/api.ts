import { runtimeStore } from "../shared/runtimeStore";
export const listProcesses = (taskId?: string) => runtimeStore.listProcesses(taskId);
export const getProcess = (id: string) => runtimeStore.getProcess(id);
export const updateProcess = (
  id: string,
  input: Parameters<typeof runtimeStore.updateProcess>[1],
) => runtimeStore.updateProcess(id, input);
