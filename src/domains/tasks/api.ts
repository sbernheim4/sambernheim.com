import { store } from "../shared/store";

export const createTask = (input: Parameters<typeof store.createTask>[0]) => {
  return store.createTask(input);
};

export const listTasks = () => {
  return store.listTasks();
};
export const getTask = (id: string) => {
  return store.getTask(id);
};
export const updateTask = (id: string, input: Parameters<typeof store.updateTask>[1]) => {
  return store.updateTask(id, input);
};
