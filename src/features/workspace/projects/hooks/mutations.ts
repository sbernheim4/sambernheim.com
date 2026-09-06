import { useMutation } from "@tanstack/react-query";
import * as api from "../../api";
import { workspaceKeys } from "../../queries";
export const useCreateProject = () =>
  useMutation({
    mutationKey: [...workspaceKeys.projects.all, "create"],
    mutationFn: api.saveProject,
    retry: false,
  });

export const useUpdateProject = (id: string) =>
  useMutation({
    mutationKey: [...workspaceKeys.projects.detail(id), "update"],
    mutationFn: (input: Parameters<typeof api.updateProject>[1]) => api.updateProject(id, input),
    retry: false,
  });
