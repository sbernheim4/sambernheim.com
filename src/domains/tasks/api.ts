import { store } from "../shared/store";

export const listTasks = () => {
  return store.listTasks();
};
export const getTask = (id: string) => {
  return store.getTask(id);
};
export const updateTask = (id: string, input: Parameters<typeof store.updateTask>[1]) => {
  return store.updateTask(id, input);
};
