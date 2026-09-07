import type {
  BootstrapData,
  OperationsResponse,
  Organization,
  ProfileResponse,
  Project,
  SaveOrganizationInput,
  SaveOrganizationResponse,
  SaveProjectInput,
  SaveProjectResponse,
  SaveTaskInput,
  SaveTaskResponse,
  Task,
  UpdateOperationsInput,
  UpdateOrganizationInput,
  UpdateProfileInput,
  UpdateProjectInput,
  UpdateTaskInput,
} from "./types";

const jsonHeaders = {
  "Content-Type": "application/json",
};
export const fetchBootstrap = async () => {
  return request<BootstrapData>("/api/bootstrap");
};
export const clearEntities = async () => {
  return request<BootstrapData>("/api/entities", { method: "DELETE" });
};
export const saveOrganization = async (input: SaveOrganizationInput) => {
  return request<SaveOrganizationResponse>("/api/organizations", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
};
export const saveProject = async (input: SaveProjectInput) => {
  return request<SaveProjectResponse>("/api/projects", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
};
export const saveTask = async (input: SaveTaskInput) => {
  return request<SaveTaskResponse>("/api/tasks", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
};
export const updateOrganization = (id: string, input: UpdateOrganizationInput) => {
  return patch<SaveOrganizationResponse>("organizations", id, input);
};
export const updateProject = (id: string, input: UpdateProjectInput) => {
  return patch<SaveProjectResponse>("projects", id, input);
};
export const updateTask = (id: string, input: UpdateTaskInput) => {
  return patch<SaveTaskResponse>("tasks", id, input);
};
const patch = <T>(collection: string, id: string, input: unknown, child?: string) => {
  return request<T>(`/api/${collection}/${encodeURIComponent(id)}${child ? `/${child}` : ""}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
};
const request = async <T>(url: string, init?: RequestInit) => {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json() as Promise<T>;
};

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
export const fetchOrganizations = () => {
  return request<Organization[]>("/api/organizations");
};
export const fetchOrganization = (id: string) => {
  return request<Organization>(`/api/organizations/${encodeURIComponent(id)}`);
};
export const fetchProjects = () => {
  return request<Project[]>("/api/projects");
};
export const fetchOrganizationProjects = (id: string) => {
  return request<Project[]>(`/api/organizations/${encodeURIComponent(id)}/projects`);
};
export const fetchProject = (id: string) => {
  return request<Project>(`/api/projects/${encodeURIComponent(id)}`);
};
export const fetchTasks = () => {
  return request<Task[]>("/api/tasks");
};
export const fetchProjectTasks = (id: string) => {
  return request<Task[]>(`/api/projects/${encodeURIComponent(id)}/tasks`);
};
export const fetchTask = (id: string) => {
  return request<Task>(`/api/tasks/${encodeURIComponent(id)}`);
};
export const fetchOrganizationProfile = (id: string) => {
  return request<import("./types").OrganizationProfile>(
    `/api/organizations/${encodeURIComponent(id)}/profile`,
  );
};
export const fetchOrganizationOperations = (id: string) => {
  return request<import("./types").OrganizationOperations>(
    `/api/organizations/${encodeURIComponent(id)}/operations`,
  );
};
export const updateOrganizationProfile = (id: string, input: UpdateProfileInput) => {
  return patch<ProfileResponse>("organizations", id, input, "profile");
};
export const updateOrganizationOperations = (id: string, input: UpdateOperationsInput) => {
  return patch<OperationsResponse>("organizations", id, input, "operations");
};
