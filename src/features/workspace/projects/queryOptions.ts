import { queryOptions } from "@tanstack/react-query";
import * as api from "../api";
import { workspaceKey } from "../queryOptions";
export const projectListsKey = () => {
  return [...workspaceKey(), "projects", "list"] as const;
};
export const projectsKey = () => {
  return [...projectListsKey(), "all"] as const;
};
export const projectsQueryOptions = () => {
  return queryOptions({ queryKey: projectsKey(), queryFn: api.fetchProjects });
};
export const organizationProjectsKey = (id: string) => {
  return [...projectListsKey(), "organization", id] as const;
};
export const organizationProjectsQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: organizationProjectsKey(id),
    queryFn: () => {
      return api.fetchOrganizationProjects(id);
    },
    enabled: !!id,
  });
};
export const projectKey = (id: string) => {
  return [...workspaceKey(), "projects", "detail", id] as const;
};
export const projectQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: projectKey(id),
    queryFn: () => {
      return api.fetchProject(id);
    },
    enabled: !!id,
    retry: (attempt, error) => {
      return !(error instanceof api.ApiError && error.status < 500) && attempt < 1;
    },
  });
};
