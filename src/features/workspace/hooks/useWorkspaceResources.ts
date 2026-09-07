import { useQuery } from "@tanstack/react-query";
import { useOrganization, useOrganizations } from "../organizations/hooks/queries";
import { useOrganizationProjects, useProject, useProjects } from "../projects/hooks/queries";
import { bootstrapQueryOptions } from "../queryOptions";
import { useProjectTasks, useTask, useTasks } from "../tasks/hooks/queries";
export const useWorkspaceResources = () => {
  return useQuery(bootstrapQueryOptions());
};

// Page-level read composition keeps resource ownership in domain queries.
export const useOrganizationsWorkspace = () => {
  const organizations = useOrganizations();
  const projects = useProjects();
  return workspaceRead([organizations, projects], {
    organizations: organizations.data ?? [],
    projects: projects.data ?? [],
    tasks: [],
  });
};
export const useOrganizationWorkspace = (id: string) => {
  const organization = useOrganization(id);
  const projects = useOrganizationProjects(id);
  const tasks = useTasks();
  return workspaceRead([organization, projects, tasks], {
    organizations: organization.data ? [organization.data] : [],
    projects: projects.data ?? [],
    tasks: tasks.data ?? [],
  });
};
export const useProjectWorkspace = (id: string) => {
  const project = useProject(id);
  const organization = useOrganization(project.data?.organizationId ?? "");
  const tasks = useProjectTasks(id);
  return workspaceRead(project.data ? [project, organization, tasks] : [project], {
    organizations: organization.data ? [organization.data] : [],
    projects: project.data ? [project.data] : [],
    tasks: tasks.data ?? [],
  });
};
export const useTaskWorkspace = (id: string) => {
  const task = useTask(id);
  const project = useProject(task.data?.projectId ?? "");
  const organization = useOrganization(task.data?.organizationId ?? "");
  return workspaceRead(task.data ? [task, project, organization] : [task], {
    organizations: organization.data ? [organization.data] : [],
    projects: project.data ? [project.data] : [],
    tasks: task.data ? [task.data] : [],
  });
};
const workspaceRead = (
  queries: Array<{
    data: unknown;
    isPending: boolean;
    isError: boolean;
    isFetching: boolean;
    errorUpdatedAt: number;
    refetch: () => unknown;
  }>,
  data: import("../types").BootstrapData,
) => {
  return {
    data,
    hasData: queries.every((q) => {
      return q.data !== undefined;
    }),
    isFetching: queries.some((q) => {
      return q.isFetching;
    }),
    errorUpdatedAt: Math.max(
      ...queries.map((q) => {
        return q.isError ? q.errorUpdatedAt : 0;
      }),
    ),
    isPending: queries.some((q) => {
      return q.isPending;
    }),
    isError: queries.some((q) => {
      return q.isError;
    }),
    refetch: () => {
      return Promise.allSettled(
        queries.map((q) => {
          return q.refetch();
        }),
      );
    },
  };
};
