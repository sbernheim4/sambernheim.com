import { reconcileWorkspaceRead } from "../cache";
import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { readReplicaResource } from "../replicaRead";
import { fetchBootstrap } from "../api";
import * as api from "../api";
import { bootstrapKey, workspaceKeys as keys } from "../queries";

export function useWorkspaceResources() {
  return useQuery({
    structuralSharing: reconcileWorkspaceRead,
    queryKey: bootstrapKey,
    queryFn: fetchBootstrap,
    staleTime: 5_000,
  });
}

export const useOrganizations = () =>
  useQuery({
    structuralSharing: reconcileWorkspaceRead,
    queryKey: keys.organizations.list(),
    queryFn: api.fetchOrganizations,
  });
export const useOrganization = (id: string) =>
  useResourceQuery(keys.organizations.detail(id), () => api.fetchOrganization(id), !!id);
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
export const useTasks = () =>
  useQuery({
    structuralSharing: reconcileWorkspaceRead,
    queryKey: keys.tasks.list(),
    queryFn: api.fetchTasks,
  });
export const useProjectTasks = (id: string) =>
  useQuery({
    structuralSharing: reconcileWorkspaceRead,
    queryKey: keys.tasks.forProject(id),
    queryFn: () => api.fetchProjectTasks(id),
    enabled: !!id,
  });
export const useTask = (id: string) =>
  useResourceQuery(keys.tasks.detail(id), () => api.fetchTask(id), !!id);

// Page-level read composition keeps resource ownership in domain queries.
export function useOrganizationsWorkspace() {
  const organizations = useOrganizations();
  const projects = useProjects();
  return workspaceRead([organizations, projects], {
    organizations: organizations.data ?? [],
    projects: projects.data ?? [],
    tasks: [],
  });
}
export function useOrganizationWorkspace(id: string) {
  const organization = useOrganization(id);
  const projects = useOrganizationProjects(id);
  const tasks = useTasks();
  return workspaceRead([organization, projects, tasks], {
    organizations: organization.data ? [organization.data] : [],
    projects: projects.data ?? [],
    tasks: tasks.data ?? [],
  });
}
export function useProjectWorkspace(id: string) {
  const project = useProject(id);
  const organization = useOrganization(project.data?.organizationId ?? "");
  const tasks = useProjectTasks(id);
  return workspaceRead(project.data ? [project, organization, tasks] : [project], {
    organizations: organization.data ? [organization.data] : [],
    projects: project.data ? [project.data] : [],
    tasks: tasks.data ?? [],
  });
}
export function useTaskWorkspace(id: string) {
  const task = useTask(id);
  const project = useProject(task.data?.projectId ?? "");
  const organization = useOrganization(task.data?.organizationId ?? "");
  return workspaceRead(task.data ? [task, project, organization] : [task], {
    organizations: organization.data ? [organization.data] : [],
    projects: project.data ? [project.data] : [],
    tasks: task.data ? [task.data] : [],
  });
}
function workspaceRead(
  queries: Array<{
    isPending: boolean;
    isError: boolean;
    refetch: () => unknown;
  }>,
  data: import("../types").BootstrapData,
) {
  return {
    data,
    isPending: queries.some((q) => q.isPending),
    isError: queries.some((q) => q.isError),
    refetch: () => Promise.allSettled(queries.map((q) => q.refetch())),
  };
}

export const useOrganizationProfile = (id: string) =>
  useResourceQuery(
    keys.organizationProfiles.detail(id),
    () => api.fetchOrganizationProfile(id),
    !!id,
  );
export const useOrganizationOperations = (id: string) =>
  useResourceQuery(
    keys.organizationOperations.detail(id),
    () => api.fetchOrganizationOperations(id),
    !!id,
  );

function useResourceQuery<T>(queryKey: QueryKey, request: () => Promise<T>, enabled: boolean) {
  const client = useQueryClient();
  return useQuery({
    queryKey,
    queryFn: () => readReplicaResource(client, queryKey, request),
    enabled,
    structuralSharing: reconcileWorkspaceRead,
    retry: (attempt, error) =>
      !(error instanceof api.ApiError && error.status < 500) && attempt < 1,
  });
}
