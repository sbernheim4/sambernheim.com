import { useQuery } from "@tanstack/react-query";
import * as api from "../../api";
import { reconcileWorkspaceRead } from "../../cache";
import { workspaceKeys as keys } from "../../queries";
import { useResourceQuery } from "../../hooks/useResourceQuery";
export const useProjects = () =>
  useQuery({
    structuralSharing: reconcileWorkspaceRead,
    queryKey: keys.projects.list(),
    queryFn: api.fetchProjects,
  });

export const useOrganizationProjects = (id: string) =>
  useQuery({
    structuralSharing: reconcileWorkspaceRead,
    queryKey: keys.projects.forOrganization(id),
    queryFn: () => api.fetchOrganizationProjects(id),
    enabled: !!id,
  });

export const useProject = (id: string) =>
  useResourceQuery(keys.projects.detail(id), () => api.fetchProject(id), !!id);
