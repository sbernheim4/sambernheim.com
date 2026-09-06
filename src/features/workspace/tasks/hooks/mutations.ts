import { useMutation } from "@tanstack/react-query";
import * as api from "../../api";
import { workspaceKeys } from "../../queries";
export const useCreateTask = () =>
  useMutation({
    mutationKey: [...workspaceKeys.tasks.all, "create"],
    mutationFn: api.saveTask,
    retry: false,
  });

export const useUpdateTask = (id: string) =>
  useMutation({
    mutationKey: [...workspaceKeys.tasks.detail(id), "update"],
    mutationFn: (input: Parameters<typeof api.updateTask>[1]) => api.updateTask(id, input),
    retry: false,
  });
