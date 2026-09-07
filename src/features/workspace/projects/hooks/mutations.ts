import { projectKey, projectListsKey } from "../queryOptions";
import { useMutation } from "@tanstack/react-query";
import * as api from "../../api";
export const useCreateProject = () => {
  return useMutation({
    mutationKey: [...projectListsKey(), "create"],
    mutationFn: api.saveProject,
    retry: false,
  });
};
export const useUpdateProject = (id: string) => {
  return useMutation({
    mutationKey: [...projectKey(id), "update"],
    mutationFn: (input: Parameters<typeof api.updateProject>[1]) => {
      return api.updateProject(id, input);
    },
    retry: false,
  });
};
