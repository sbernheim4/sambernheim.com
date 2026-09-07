import { workspaceRepository } from "./repository";
export { ApiError } from "./repository";
import type {
  UpdateOperationsInput,
  UpdateOrganizationInput,
  UpdateProfileInput,
  UpdateProjectInput,
  UpdateTaskInput,
} from "./types";

export const fetchBootstrap = () => {
  return workspaceRepository.bootstrap();
};

export const clearEntities = () => {
  return workspaceRepository.clear();
};
export const saveOrganization = (
  input: Parameters<typeof workspaceRepository.saveOrganization>[0],
) => {
  return workspaceRepository.saveOrganization(input);
};

export const saveProject = (input: Parameters<typeof workspaceRepository.saveProject>[0]) => {
  return workspaceRepository.saveProject(input);
};

export const saveTask = (input: Parameters<typeof workspaceRepository.saveTask>[0]) => {
  return workspaceRepository.saveTask(input);
};

export const updateOrganization = (id: string, input: UpdateOrganizationInput) => {
  return workspaceRepository.updateOrganization(id, input);
};

export const updateProject = (id: string, input: UpdateProjectInput) => {
  return workspaceRepository.updateProject(id, input);
};

export const updateTask = (id: string, input: UpdateTaskInput) => {
  return workspaceRepository.updateTask(id, input);
};

export const fetchOrganizations = () => {
  return workspaceRepository.organizations();
};

export const fetchOrganization = (id: string) => {
  return workspaceRepository.organizationById(id);
};

export const fetchProjects = () => {
  return workspaceRepository.projects();
};

export const fetchOrganizationProjects = (id: string) => {
  return workspaceRepository.projectByOrganization(id);
};

export const fetchProject = (id: string) => {
  return workspaceRepository.projectById(id);
};

export const fetchTasks = () => {
  return workspaceRepository.tasks();
};

export const fetchProjectTasks = (id: string) => {
  return workspaceRepository.taskByProject(id);
};

export const fetchTask = (id: string) => {
  return workspaceRepository.taskById(id);
};

export const fetchOrganizationProfile = (id: string) => {
  return workspaceRepository.profile(id);
};

export const fetchOrganizationOperations = (id: string) => {
  return workspaceRepository.operations(id);
};

export const updateOrganizationProfile = (id: string, input: UpdateProfileInput) => {
  return workspaceRepository.updateProfile(id, input);
};

export const updateOrganizationOperations = (id: string, input: UpdateOperationsInput) => {
  return workspaceRepository.updateOperations(id, input);
};
