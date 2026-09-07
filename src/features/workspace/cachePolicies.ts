import { bootstrapKey } from "./queryOptions";
import { projectTasksKey, taskKey, tasksKey } from "./tasks/queryOptions";
import { organizationProjectsKey, projectKey, projectsKey } from "./projects/queryOptions";
import { organizationKey, organizationOperationsKey, organizationProfileKey, organizationsKey } from "./organizations/queryOptions";
import type { CacheUpdate } from "../../forms/orchestration/types";
import { reconcileWorkspaceRead, upsertBootstrap } from "./cache";
import type {
  Organization,
  Project,
  SaveOrganizationResponse,
  SaveProjectResponse,
  SaveTaskResponse,
  Task,
} from "./types";

export function organizationCacheUpdates<I>(): CacheUpdate<SaveOrganizationResponse, I>[] {
  return [
    {
      queryKey: () => bootstrapKey(),
      update: (previous, { response }) =>
        upsertBootstrap(previous, { organizations: [response.organization] }),
    },
    {
      queryKey: () => organizationsKey(),
      update: (previous, { response }) => upsertList(previous, response.organization),
    },
    {
      queryKey: ({ response }) => organizationKey(response.organization.id),
      getData: (response) => response.organization,
    },
    {
      queryKey: ({ response }) => organizationProfileKey(response.organization.id),
      getData: ({ organization: o }) => ({
        organizationId: o.id,
        name: o.name,
        sector: o.sector,
        updatedAt: o.profileUpdatedAt ?? o.updatedAt,
      }),
    },
    {
      queryKey: ({ response }) => organizationOperationsKey(response.organization.id),
      getData: ({ organization: o }) => ({
        organizationId: o.id,
        status: o.status,
        region: o.region,
        updatedAt: o.operationsUpdatedAt ?? o.updatedAt,
      }),
    },
  ];
}
export function projectCacheUpdates<I>(): CacheUpdate<SaveProjectResponse, I>[] {
  return [
    {
      queryKey: () => bootstrapKey(),
      update: (previous, { response }) =>
        upsertBootstrap(previous, { projects: [response.project] }),
    },
    {
      queryKey: () => projectsKey(),
      update: (previous, { response }) => upsertList(previous, response.project),
    },
    {
      queryKey: ({ response }) => organizationProjectsKey(response.project.organizationId),
      update: (previous, { response }) => upsertList(previous, response.project),
    },
    {
      queryKey: ({ response }) => projectKey(response.project.id),
      getData: (response) => response.project,
    },
  ];
}
export function taskCacheUpdates<I>(): CacheUpdate<SaveTaskResponse, I>[] {
  return [
    {
      queryKey: () => bootstrapKey(),
      update: (previous, { response }) => upsertBootstrap(previous, { tasks: [response.task] }),
    },
    {
      queryKey: () => tasksKey(),
      update: (previous, { response }) => upsertList(previous, response.task),
    },
    {
      queryKey: ({ response }) => projectTasksKey(response.task.projectId),
      update: (previous, { response }) => upsertList(previous, response.task),
    },
    {
      queryKey: ({ response }) => taskKey(response.task.id),
      getData: (response) => response.task,
    },
  ];
}
export function upsertList<T extends Organization | Project | Task>(
  previous: unknown,
  resource: T,
): T[] {
  const current = (previous as T[] | undefined) ?? [];
  return reconcileWorkspaceRead(current, [resource]) as T[];
}
