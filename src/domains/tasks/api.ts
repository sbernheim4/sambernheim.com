import { runtimeStore } from "../shared/runtimeStore";
export const listTasks = () => runtimeStore.listTasks();
export const getTask = (id: string) => runtimeStore.getTask(id);
export const updateTask = (id: string, input: Parameters<typeof runtimeStore.updateTask>[1]) =>
  runtimeStore.updateTask(id, input);
