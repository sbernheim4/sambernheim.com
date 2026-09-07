import { taskKey, taskListsKey } from "../queryOptions";
import { useMutation } from "@tanstack/react-query";
import * as api from "../../api";
export const useCreateTask = () => {
  return useMutation({
    mutationKey: [...taskListsKey(), "create"],
    mutationFn: api.saveTask,
    retry: false,
  });
};
export const useUpdateTask = (id: string) => {
  return useMutation({
    mutationKey: [...taskKey(id), "update"],
    mutationFn: (input: Parameters<typeof api.updateTask>[1]) => {
      return api.updateTask(id, input);
    },
    retry: false,
  });
};
