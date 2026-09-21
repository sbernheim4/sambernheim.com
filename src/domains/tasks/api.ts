import { store } from "../shared/store";

export const listTasks = () => store.listTasks();
export const getTask = (id: string) => store.getTask(id);
export const updateTask = (id: string, input: Parameters<typeof store.updateTask>[1]) =>
  store.updateTask(id, input);
