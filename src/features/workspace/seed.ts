import type { OrganizationOperations, OrganizationProfile, Project, Task } from "./types";

export const seedWorkspace = {
  organizations: [{ id: "org-1" }],
  profiles: [
    {
      organizationId: "org-1",
      name: "Existing Clinic",
      sector: "healthcare",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ] satisfies OrganizationProfile[],
  operations: [
    {
      organizationId: "org-1",
      status: "active",
      region: "east",
      updatedAt: "2024-01-01T00:00:00.001Z",
    },
  ] satisfies OrganizationOperations[],
  projects: [
    {
      id: "project-1",
      organizationId: "org-1",
      name: "Care Navigation",
      priority: "high",
      phase: "implementation",
      budget: "$125k",
      updatedAt: "2024-01-01T00:00:00.002Z",
    },
  ] satisfies Project[],
  tasks: [
    {
      id: "task-1",
      organizationId: "org-1",
      projectId: "project-1",
      title: "Configure intake routing",
      owner: "alex",
      status: "in-progress",
      dueWindow: "this-week",
      updatedAt: "2024-01-01T00:00:00.003Z",
    },
  ] satisfies Task[],
  nextId: 2,
  lastTimestamp: "2024-01-01T00:00:00.003Z",
};
