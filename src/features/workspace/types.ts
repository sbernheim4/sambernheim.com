export type Organization = {
  profileUpdatedAt?: string;
  operationsUpdatedAt?: string;
  id: string;
  name: string;
  sector: "healthcare" | "finance" | "education";
  status: "active" | "paused";
  region: "east" | "central" | "west";
  updatedAt: string;
};

export type Project = {
  id: string;
  organizationId: string;
  name: string;
  priority: "low" | "medium" | "high";
  phase: "planning" | "implementation" | "launched";
  budget: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  organizationId: string;
  projectId: string;
  title: string;
  owner: "alex" | "jordan" | "morgan";
  status: "todo" | "in-progress" | "blocked";
  dueWindow: "this-week" | "next-week" | "this-month";
  updatedAt: string;
};

export type BootstrapData = {
  organizations: Organization[];
  projects: Project[];
  tasks: Task[];
};

export type SaveOrganizationInput = {
  name: string;
  sector: Organization["sector"];
  status: Organization["status"];
  region: Organization["region"];
};
export type UpdateOrganizationInput = Partial<SaveOrganizationInput>;

export type SaveProjectInput = {
  organizationId: string;
  name: string;
  priority: Project["priority"];
  phase: Project["phase"];
  budget: string;
};
export type UpdateProjectInput = Partial<Omit<SaveProjectInput, "organizationId">>;

export type SaveTaskInput = {
  organizationId: string;
  projectId: string;
  title: string;
  owner: Task["owner"];
  status: Task["status"];
  dueWindow: Task["dueWindow"];
};
export type UpdateTaskInput = Partial<Omit<SaveTaskInput, "organizationId" | "projectId">>;

export type SaveOrganizationResponse = {
  organization: Organization;
  readModelLagMs: number;
};

export type SaveProjectResponse = {
  project: Project;
  readModelLagMs: number;
};

export type SaveTaskResponse = {
  task: Task;
  readModelLagMs: number;
};

export type OrganizationProfile = Pick<Organization, "name" | "sector" | "updatedAt"> & {
  organizationId: string;
};
export type OrganizationOperations = Pick<Organization, "status" | "region" | "updatedAt"> & {
  organizationId: string;
};
export type ProfileInput = Pick<OrganizationProfile, "name" | "sector">;
export type UpdateProfileInput = Partial<ProfileInput>;
export type OperationsInput = Pick<OrganizationOperations, "status" | "region">;
export type UpdateOperationsInput = Partial<OperationsInput>;
export type ProfileResponse = {
  profile: OrganizationProfile;
  readModelLagMs: number;
};
export type OperationsResponse = {
  operations: OrganizationOperations;
  readModelLagMs: number;
};
