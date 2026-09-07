import { useQuery } from "@tanstack/react-query";
import {
  projectsQueryOptions,
  organizationProjectsQueryOptions,
  projectQueryOptions,
} from "../queryOptions";
export const useProjects = () => {
  return useQuery(projectsQueryOptions());
};
export const useOrganizationProjects = (id: string) => {
  return useQuery(organizationProjectsQueryOptions(id));
};
export const useProject = (id: string) => {
  return useQuery(projectQueryOptions(id));
};
