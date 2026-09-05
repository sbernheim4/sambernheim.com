import type { IncomingMessage, ServerResponse } from "node:http";

import type {
  Organization,
  Project,
  Task,
  OrganizationProfile,
  OrganizationOperations,
  UpdateOrganizationInput,
  UpdateProjectInput,
  UpdateTaskInput,
  UpdateProfileInput,
  UpdateOperationsInput,
} from "../src/features/workspace/types.ts";
type Store = {
  organizations: { id: string }[];
  profiles: OrganizationProfile[];
  operations: OrganizationOperations[];
  projects: Project[];
  tasks: Task[];
};

type RequestBody = Record<string, unknown>;

export function createExampleApi({ readModelLagMs = 2500 }: { readModelLagMs?: number } = {}) {
  let nextId = 2;
  let lastTimestamp = 0;
  const now = () => {
    lastTimestamp = Math.max(Date.now(), lastTimestamp + 1);
    return new Date(lastTimestamp).toISOString();
  };
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const writeStore: Store = {
    organizations: [{ id: "org-1" }],
    profiles: [
      {
        organizationId: "org-1",
        name: "Existing Clinic",
        sector: "healthcare",
        updatedAt: now(),
      },
    ],
    operations: [
      {
        organizationId: "org-1",
        status: "active",
        region: "east",
        updatedAt: now(),
      },
    ],
    projects: [
      {
        id: "project-1",
        organizationId: "org-1",
        name: "Care Navigation",
        priority: "high",
        phase: "implementation",
        budget: "$125k",
        updatedAt: now(),
      },
    ],
    tasks: [
      {
        id: "task-1",
        organizationId: "org-1",
        projectId: "project-1",
        title: "Configure intake routing",
        owner: "alex",
        status: "in-progress",
        dueWindow: "this-week",
        updatedAt: now(),
      },
    ],
  };
  let readStore: Store = structuredClone(writeStore);

  async function handleApiRequest(request: IncomingMessage, response: ServerResponse) {
    try {
      const path = new URL(request.url ?? "/", "http://localhost").pathname;
      const childMatch = path.match(/^\/api\/organizations\/([^/]+)\/(profile|operations)$/);
      if (childMatch && (request.method === "GET" || request.method === "PATCH")) {
        const store = request.method === "GET" ? readStore : writeStore;
        const id = decodeURIComponent(childMatch[1]);
        const parent = store.organizations.find((item) => item.id === id);
        if (!parent) return sendJson(response, { message: "Organization not found." }, 404);
        const profile = store.profiles.find((item) => item.organizationId === id)!;
        const operations = store.operations.find((item) => item.organizationId === id)!;
        if (request.method === "GET")
          return sendJson(response, childMatch[2] === "profile" ? profile : operations);
        const body = await readJson(request);
        if (childMatch[2] === "profile") updateProfile(profile, body);
        else updateOperations(operations, body);
        scheduleReplicaSync();
        return sendJson(
          response,
          childMatch[2] === "profile"
            ? { profile, readModelLagMs }
            : { operations, readModelLagMs },
        );
      }
      const editMatch = path.match(/^\/api\/(organizations|projects|tasks)\/([^/]+)$/);
      if (request.method === "GET") {
        if (editMatch) {
          const collection = editMatch[1] as "organizations" | "projects" | "tasks";
          const entity = bootstrap(readStore)[collection].find(
            (item) => item.id === decodeURIComponent(editMatch[2]),
          );
          return sendJson(
            response,
            entity ?? { message: "Resource not found." },
            entity ? 200 : 404,
          );
        }
        const list = path.match(/^\/api\/(organizations|projects|tasks)$/);
        if (list)
          return sendJson(
            response,
            bootstrap(readStore)[list[1] as "organizations" | "projects" | "tasks"],
          );
        const children = path.match(/^\/api\/(organizations|projects)\/([^/]+)\/(projects|tasks)$/);
        if (children) {
          const id = decodeURIComponent(children[2]);
          if (children[1] === "organizations" && children[3] === "projects")
            return sendJson(
              response,
              readStore.projects.filter((item) => item.organizationId === id),
            );
          if (children[1] === "projects" && children[3] === "tasks")
            return sendJson(
              response,
              readStore.tasks.filter((item) => item.projectId === id),
            );
        }
      }
      if (request.method === "PATCH" && editMatch) {
        const collection = editMatch[1] as "organizations" | "projects" | "tasks";
        const entity = writeStore[collection].find((item) => item.id === editMatch[2]);
        if (!entity) return sendJson(response, { message: "Resource not found." }, 404);
        if (collection === "organizations") {
          const body = (await readJson(request)) as UpdateOrganizationInput;
          const profile = writeStore.profiles.find((item) => item.organizationId === entity.id)!;
          const operations = writeStore.operations.find(
            (item) => item.organizationId === entity.id,
          )!;
          updateProfile(profile, body);
          updateOperations(operations, body);
          const organization = projectOrganization(writeStore, entity.id);
          scheduleReplicaSync();
          return sendJson(response, { organization, readModelLagMs });
        }
        if (collection === "projects") {
          const body = (await readJson(request)) as UpdateProjectInput;
          const project = entity as Project;
          Object.assign(project, {
            name: cleanString(body.name, project.name),
            priority: oneOf(body.priority, ["low", "medium", "high"], project.priority),
            phase: oneOf(body.phase, ["planning", "implementation", "launched"], project.phase),
            budget: cleanString(body.budget, project.budget),
            updatedAt: now(),
          });
          scheduleReplicaSync();
          return sendJson(response, { project, readModelLagMs });
        }
        const body = (await readJson(request)) as UpdateTaskInput;
        const task = entity as Task;
        Object.assign(task, {
          title: cleanString(body.title, task.title),
          owner: oneOf(body.owner, ["alex", "jordan", "morgan"], task.owner),
          status: oneOf(body.status, ["todo", "in-progress", "blocked"], task.status),
          dueWindow: oneOf(
            body.dueWindow,
            ["this-week", "next-week", "this-month"],
            task.dueWindow,
          ),
          updatedAt: now(),
        });
        scheduleReplicaSync();
        return sendJson(response, { task, readModelLagMs });
      }

      if (request.method === "DELETE" && request.url === "/api/entities") {
        writeStore.tasks = [];
        writeStore.projects = [];
        writeStore.organizations = [];
        writeStore.profiles = [];
        writeStore.operations = [];
        for (const timer of timers) clearTimeout(timer);
        timers.clear();
        readStore = structuredClone(writeStore);
        return sendJson(response, bootstrap(readStore));
      }

      if (request.method === "GET" && request.url === "/api/bootstrap") {
        return sendJson(response, bootstrap(readStore));
      }

      if (request.method === "POST" && request.url === "/api/organizations") {
        const body = await readJson(request);
        const name = requiredString(body, "name");
        const sector = requiredOption(body, "sector", [
          "healthcare",
          "finance",
          "education",
        ] as const);
        const status = requiredOption(body, "status", ["active", "paused"] as const);
        const region = requiredOption(body, "region", ["east", "central", "west"] as const);
        if (!name || !sector || !status || !region) {
          return sendJson(response, { message: "Missing organization fields." }, 400);
        }
        const organization = {
          id: `org-${nextId++}`,
          name,
          sector,
          status,
          region,
          updatedAt: now(),
        };

        writeStore.organizations.push({ id: organization.id });
        writeStore.profiles.push({
          organizationId: organization.id,
          name: organization.name,
          sector: organization.sector,
          updatedAt: organization.updatedAt,
        });
        writeStore.operations.push({
          organizationId: organization.id,
          status: organization.status,
          region: organization.region,
          updatedAt: organization.updatedAt,
        });
        scheduleReplicaSync();

        return sendJson(response, { organization, readModelLagMs });
      }

      if (request.method === "POST" && request.url === "/api/projects") {
        const body = await readJson(request);
        const organizationId = requiredString(body, "organizationId");
        const name = requiredString(body, "name");
        const priority = requiredOption(body, "priority", ["low", "medium", "high"] as const);
        const phase = requiredOption(body, "phase", [
          "planning",
          "implementation",
          "launched",
        ] as const);
        const budget = requiredString(body, "budget");
        if (!organizationId || !name || !priority || !phase || !budget) {
          return sendJson(response, { message: "Missing project fields." }, 400);
        }
        if (!writeStore.organizations.some((item) => item.id === organizationId)) {
          return sendJson(response, { message: "Choose an existing organization." }, 400);
        }
        const project = {
          id: `project-${nextId++}`,
          organizationId,
          name,
          priority,
          phase,
          budget,
          updatedAt: now(),
        };

        writeStore.projects.push(project);
        scheduleReplicaSync();

        return sendJson(response, { project, readModelLagMs });
      }

      if (request.method === "POST" && request.url === "/api/tasks") {
        const body = await readJson(request);
        const organizationId = requiredString(body, "organizationId");
        const projectId = requiredString(body, "projectId");
        const title = requiredString(body, "title");
        const owner = requiredOption(body, "owner", ["alex", "jordan", "morgan"] as const);
        const status = requiredOption(body, "status", ["todo", "in-progress", "blocked"] as const);
        const dueWindow = requiredOption(body, "dueWindow", [
          "this-week",
          "next-week",
          "this-month",
        ] as const);
        if (!organizationId || !projectId || !title || !owner || !status || !dueWindow) {
          return sendJson(response, { message: "Missing task fields." }, 400);
        }
        const parent = writeStore.projects.find((item) => item.id === projectId);
        if (!parent || parent.organizationId !== organizationId) {
          return sendJson(
            response,
            { message: "Choose a project belonging to this organization." },
            400,
          );
        }
        const task = {
          id: `task-${nextId++}`,
          organizationId,
          projectId,
          title,
          owner,
          status,
          dueWindow,
          updatedAt: now(),
        };

        writeStore.tasks.push(task);
        scheduleReplicaSync();

        return sendJson(response, { task, readModelLagMs });
      }

      response.writeHead(404);
      response.end("Not found");
    } catch (error) {
      response.writeHead(500);
      response.end(error instanceof Error ? error.message : "Unknown error");
    }
  }

  function scheduleReplicaSync() {
    const timer = setTimeout(() => {
      timers.delete(timer);
      readStore = structuredClone(writeStore);
    }, readModelLagMs);
    timer.unref();
    timers.add(timer);
  }
  function updateProfile(profile: OrganizationProfile, body: UpdateProfileInput) {
    Object.assign(profile, {
      name: cleanString(body.name, profile.name),
      sector: oneOf(body.sector, ["healthcare", "finance", "education"], profile.sector),
      updatedAt: now(),
    });
  }
  function updateOperations(operations: OrganizationOperations, body: UpdateOperationsInput) {
    Object.assign(operations, {
      status: oneOf(body.status, ["active", "paused"], operations.status),
      region: oneOf(body.region, ["east", "central", "west"], operations.region),
      updatedAt: now(),
    });
  }
  return {
    handleApiRequest,
    dispose: () => {
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
    },
  };
}

function projectOrganization(store: Store, id: string): Organization {
  const profile = store.profiles.find((item) => item.organizationId === id)!;
  const operations = store.operations.find((item) => item.organizationId === id)!;
  return {
    id,
    name: profile.name,
    sector: profile.sector,
    status: operations.status,
    region: operations.region,
    updatedAt: profile.updatedAt > operations.updatedAt ? profile.updatedAt : operations.updatedAt,
    profileUpdatedAt: profile.updatedAt,
    operationsUpdatedAt: operations.updatedAt,
  };
}
function bootstrap(store: Store) {
  return {
    organizations: store.organizations.map((item) => projectOrganization(store, item.id)),
    projects: store.projects,
    tasks: store.tasks,
  };
}
function requiredString(body: RequestBody, key: string) {
  const value = body[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function requiredOption<T extends string>(body: RequestBody, key: string, values: readonly T[]) {
  const value = body[key];
  return typeof value === "string" && (values as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}
export const { handleApiRequest } = createExampleApi();

function sendJson(response: ServerResponse, value: unknown, status = 200) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(JSON.stringify(value));
}

async function readJson(request: IncomingMessage): Promise<RequestBody> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function cleanString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function oneOf<TValue extends string>(
  value: unknown,
  allowed: readonly TValue[],
  fallback: TValue,
) {
  return typeof value === "string" && allowed.includes(value as TValue)
    ? (value as TValue)
    : fallback;
}
