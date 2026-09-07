import { projectKey, projectListsKey } from "../queryOptions";
import { useMutation } from "@tanstack/react-query";
import * as api from "../../api";
export const useCreateProject = () =>
  useMutation({
    mutationKey: [...projectListsKey(), "create"],
    mutationFn: api.saveProject,
    retry: false,
  });

export const useUpdateProject = (id: string) =>
  useMutation({
    mutationKey: [...projectKey(id), "update"],
    mutationFn: (input: Parameters<typeof api.updateProject>[1]) => api.updateProject(id, input),
    retry: false,
  });
