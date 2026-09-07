import type {
  BootstrapData,
  OperationsResponse,
  Organization,
  OrganizationOperations,
  OrganizationProfile,
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
import { seedWorkspace } from "./seed";

const DB_NAME = "monaco-lsp-workspace";
const DB_VERSION = 1;
const WORKSPACE = "shared";
const STORES = [
  "workspace",
  "organizations",
  "profiles",
  "operations",
  "projects",
  "tasks",
  "metadata",
] as const;
type StoreName = (typeof STORES)[number];
type Entity =
  | Organization
  | OrganizationProfile
  | OrganizationOperations
  | Project
  | Task
  | { id: string };
type WorkspaceRecord = { key: string; initializedAt: string };

const hasIndexedDb = () => {
  return typeof globalThis !== "undefined" && "indexedDB" in globalThis;
};

const dbRequest = <T>(request: IDBRequest<T>) => {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => {
      return resolve(request.result);
    };
    request.onerror = () => {
      return reject(request.error ?? new Error("IndexedDB request failed."));
    };
  });
};

const waitForTransaction = (tx: IDBTransaction) => {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => {
      return resolve();
    };
    tx.onerror = () => {
      return reject(tx.error ?? new Error("IndexedDB transaction failed."));
    };
    tx.onabort = () => {
      return reject(tx.error ?? new Error("IndexedDB transaction aborted."));
    };
  });
};

const openDatabase = (factory: IDBFactory = globalThis.indexedDB) => {
  if (!hasIndexedDb()) {
    throw new Error("Workspace persistence is only available in a browser.");
  }
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, {
            keyPath:
              store === "metadata"
                ? "key"
                : store === "workspace"
                  ? "key"
                  : store === "profiles" || store === "operations"
                    ? "organizationId"
                    : "id",
          });
        }
      }
    };
    request.onsuccess = () => {
      return resolve(request.result);
    };
    request.onerror = () => {
      return reject(request.error ?? new Error("Unable to open workspace database."));
    };
  });
};

const cleanString = (value: unknown, fallback: string) => {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T) => {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
};

const requiredString = (value: unknown) => {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

const requiredOption = <T extends string>(value: unknown, allowed: readonly T[]) => {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : undefined;
};

const now = (last: string) => {
  const timestamp = Math.max(Date.now(), new Date(last).getTime() + 1);
  return new Date(timestamp).toISOString();
};
const error = (status: number, message: string): never => {
  throw new ApiError(status, message);
};

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type WorkspaceRepositoryOptions = {
  channel?: BroadcastChannel | null;
  indexedDB?: IDBFactory;
};

export class WorkspaceRepository {
  private dbPromise?: Promise<IDBDatabase>;
  private readonly channel: BroadcastChannel | null;
  private readonly indexedDB?: IDBFactory;
  constructor(options: WorkspaceRepositoryOptions = {}) {
    this.indexedDB = options.indexedDB;
    this.channel =
      options.channel === undefined && typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("monaco-lsp-workspace")
        : (options.channel ?? null);
  }
  private db() {
    return (this.dbPromise ??= openDatabase(this.indexedDB));
  }

  private async ensureSeeded(db: IDBDatabase) {
    const read = db.transaction("workspace", "readonly");
    const existing = await dbRequest(read.objectStore("workspace").get(WORKSPACE));
    if (existing) {
      return;
    }
    const tx = db.transaction([...STORES], "readwrite");
    tx.objectStore("workspace").put({
      key: WORKSPACE,
      initializedAt: new Date().toISOString(),
    } satisfies WorkspaceRecord);
    for (const [store, values] of Object.entries(seedWorkspace)) {
      if (store === "nextId" || store === "lastTimestamp") {
        continue;
      }
      for (const value of values as Entity[]) {
        tx.objectStore(store).put(structuredClone(value));
      }
    }
    tx.objectStore("metadata").put({ key: "nextId", value: seedWorkspace.nextId });
    tx.objectStore("metadata").put({ key: "lastTimestamp", value: seedWorkspace.lastTimestamp });
    await waitForTransaction(tx);
  }

  private async readStore<T extends Entity>(store: StoreName): Promise<T[]> {
    const db = await this.db();
    await this.ensureSeeded(db);
    const tx = db.transaction(store, "readonly");
    return (await dbRequest(tx.objectStore(store).getAll())) as T[];
  }

  private async write(stores: StoreName[], run: (tx: IDBTransaction) => void) {
    const db = await this.db();
    await this.ensureSeeded(db);
    const tx = db.transaction(stores, "readwrite");
    run(tx);
    await waitForTransaction(tx);
    this.channel?.postMessage({ type: "workspace-mutated" });
  }

  private async metadata(db: IDBDatabase, key: string) {
    return (await dbRequest(
      db.transaction("metadata", "readonly").objectStore("metadata").get(key),
    )) as { value: number | string } | undefined;
  }

  private async timestamp(db: IDBDatabase) {
    const item = await this.metadata(db, "lastTimestamp");
    return now(String(item?.value ?? "1970-01-01T00:00:00.000Z"));
  }

  private async id(db: IDBDatabase, prefix: string) {
    const item = await this.metadata(db, "nextId");
    const next = Number(item?.value ?? 2);
    return { id: `${prefix}-${next}`, next };
  }

  private async organization(_db: IDBDatabase, id: string) {
    const [profiles, operations] = await Promise.all([
      this.readStore<OrganizationProfile>("profiles"),
      this.readStore<OrganizationOperations>("operations"),
    ]);
    const profile =
      profiles.find((x) => {
        return x.organizationId === id;
      }) ?? error(404, "Organization not found.");
    const ops =
      operations.find((x) => {
        return x.organizationId === id;
      }) ?? error(404, "Organization not found.");
    return {
      id,
      name: profile.name,
      sector: profile.sector,
      status: ops.status,
      region: ops.region,
      updatedAt: profile.updatedAt > ops.updatedAt ? profile.updatedAt : ops.updatedAt,
      profileUpdatedAt: profile.updatedAt,
      operationsUpdatedAt: ops.updatedAt,
    } satisfies Organization;
  }
  async bootstrap(): Promise<BootstrapData> {
    const [orgs, projects, tasks] = await Promise.all([
      this.readStore<{ id: string }>("organizations"),
      this.readStore<Project>("projects"),
      this.readStore<Task>("tasks"),
    ]);
    const db = await this.db();
    return {
      organizations: await Promise.all(
        orgs.map((x) => {
          return this.organization(db, x.id);
        }),
      ),
      projects,
      tasks,
    };
  }

  async organizations() {
    return (await this.bootstrap()).organizations;
  }

  async organizationById(id: string) {
    return this.organization(await this.db(), id);
  }

  async projects() {
    return this.readStore<Project>("projects");
  }

  async projectByOrganization(id: string) {
    return (await this.projects()).filter((x) => {
      return x.organizationId === id;
    });
  }

  async projectById(id: string) {
    const item = (await this.projects()).find((x) => {
      return x.id === id;
    });
    return item ?? error(404, "Resource not found.");
  }

  async tasks() {
    return this.readStore<Task>("tasks");
  }

  async taskByProject(id: string) {
    return (await this.tasks()).filter((x) => {
      return x.projectId === id;
    });
  }

  async taskById(id: string) {
    const item = (await this.tasks()).find((x) => {
      return x.id === id;
    });
    return item ?? error(404, "Resource not found.");
  }

  async profile(id: string) {
    const item = (await this.readStore<OrganizationProfile>("profiles")).find((x) => {
      return x.organizationId === id;
    });
    return item ?? error(404, "Organization not found.");
  }

  async operations(id: string) {
    const item = (await this.readStore<OrganizationOperations>("operations")).find((x) => {
      return x.organizationId === id;
    });
    return item ?? error(404, "Organization not found.");
  }

  async saveOrganization(input: SaveOrganizationInput): Promise<SaveOrganizationResponse> {
    const name = requiredString(input.name);
    const sector = requiredOption(input.sector, ["healthcare", "finance", "education"]);
    const status = requiredOption(input.status, ["active", "paused"]);
    const region = requiredOption(input.region, ["east", "central", "west"]);
    if (!name || !sector || !status || !region) {
      error(400, "Missing organization fields.");
    }
    const validName = name ?? error(400, "Missing organization fields.");
    const validSector = sector ?? error(400, "Missing organization fields.");
    const validStatus = status ?? error(400, "Missing organization fields.");
    const validRegion = region ?? error(400, "Missing organization fields.");
    const db = await this.db();
    const stamp = await this.timestamp(db);
    const { id, next } = await this.id(db, "org");
    const organization = {
      id,
      name: validName,
      sector: validSector,
      status: validStatus,
      region: validRegion,
      updatedAt: stamp,
    };
    await this.write(["organizations", "profiles", "operations", "metadata"], (tx) => {
      tx.objectStore("organizations").put({ id });
      tx.objectStore("profiles").put({
        organizationId: id,
        name: organization.name,
        sector: organization.sector,
        updatedAt: stamp,
      });
      tx.objectStore("operations").put({
        organizationId: id,
        status: organization.status,
        region: organization.region,
        updatedAt: stamp,
      });
      tx.objectStore("metadata").put({ key: "nextId", value: next + 1 });
      tx.objectStore("metadata").put({ key: "lastTimestamp", value: stamp });
    });
    return { organization };
  }

  async saveProject(input: SaveProjectInput): Promise<SaveProjectResponse> {
    if (
      !(await this.organizations()).some((x) => {
        return x.id === input.organizationId;
      })
    ) {
      error(400, "Choose an existing organization.");
    }
    const name = requiredString(input.name);
    const budget = requiredString(input.budget);
    const priority = requiredOption(input.priority, ["low", "medium", "high"]);
    const phase = requiredOption(input.phase, ["planning", "implementation", "launched"]);
    if (!name || !budget || !priority || !phase) {
      error(400, "Missing project fields.");
    }
    const validName = name ?? error(400, "Missing project fields.");
    const validBudget = budget ?? error(400, "Missing project fields.");
    const validPriority = priority ?? error(400, "Missing project fields.");
    const validPhase = phase ?? error(400, "Missing project fields.");
    const db = await this.db();
    const stamp = await this.timestamp(db);
    const { id, next } = await this.id(db, "project");
    const project = {
      id,
      organizationId: input.organizationId,
      name: validName,
      priority: validPriority,
      phase: validPhase,
      budget: validBudget,
      updatedAt: stamp,
    };
    await this.write(["projects", "metadata"], (tx) => {
      tx.objectStore("projects").put(project);
      tx.objectStore("metadata").put({ key: "nextId", value: next + 1 });
      tx.objectStore("metadata").put({ key: "lastTimestamp", value: stamp });
    });
    return { project };
  }

  async saveTask(input: SaveTaskInput): Promise<SaveTaskResponse> {
    const parent = (await this.projects()).find((x) => {
      return x.id === input.projectId;
    });
    if (!parent || parent.organizationId !== input.organizationId) {
      error(400, "Choose a project belonging to this organization.");
    }
    const title = requiredString(input.title);
    const owner = requiredOption(input.owner, ["alex", "jordan", "morgan"]);
    const status = requiredOption(input.status, ["todo", "in-progress", "blocked"]);
    const dueWindow = requiredOption(input.dueWindow, ["this-week", "next-week", "this-month"]);
    if (!title || !owner || !status || !dueWindow) {
      error(400, "Missing task fields.");
    }
    const validTitle = title ?? error(400, "Missing task fields.");
    const validOwner = owner ?? error(400, "Missing task fields.");
    const validStatus = status ?? error(400, "Missing task fields.");
    const validDueWindow = dueWindow ?? error(400, "Missing task fields.");
    const db = await this.db();
    const stamp = await this.timestamp(db);
    const { id, next } = await this.id(db, "task");
    const task = {
      id,
      organizationId: input.organizationId,
      projectId: input.projectId,
      title: validTitle,
      owner: validOwner,
      status: validStatus,
      dueWindow: validDueWindow,
      updatedAt: stamp,
    };
    await this.write(["tasks", "metadata"], (tx) => {
      tx.objectStore("tasks").put(task);
      tx.objectStore("metadata").put({ key: "nextId", value: next + 1 });
      tx.objectStore("metadata").put({ key: "lastTimestamp", value: stamp });
    });
    return { task };
  }

  async updateOrganization(
    id: string,
    input: UpdateOrganizationInput,
  ): Promise<SaveOrganizationResponse> {
    await this.profile(id);
    await this.operations(id);
    const db = await this.db();
    const stamp = await this.timestamp(db);
    const profile = await this.profile(id);
    const ops = await this.operations(id);
    const nextProfile = {
      ...profile,
      name: cleanString(input.name, profile.name),
      sector: oneOf(input.sector, ["healthcare", "finance", "education"], profile.sector),
      updatedAt: stamp,
    };
    const nextOps = {
      ...ops,
      status: oneOf(input.status, ["active", "paused"], ops.status),
      region: oneOf(input.region, ["east", "central", "west"], ops.region),
      updatedAt: stamp,
    };
    await this.write(["profiles", "operations", "metadata"], (tx) => {
      tx.objectStore("profiles").put(nextProfile);
      tx.objectStore("operations").put(nextOps);
      tx.objectStore("metadata").put({ key: "lastTimestamp", value: stamp });
    });
    return { organization: await this.organization(db, id) };
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<SaveProjectResponse> {
    const project = await this.projectById(id);
    const db = await this.db();
    const stamp = await this.timestamp(db);
    const next = {
      ...project,
      name: cleanString(input.name, project.name),
      priority: oneOf(input.priority, ["low", "medium", "high"], project.priority),
      phase: oneOf(input.phase, ["planning", "implementation", "launched"], project.phase),
      budget: cleanString(input.budget, project.budget),
      updatedAt: stamp,
    };
    await this.write(["projects", "metadata"], (tx) => {
      tx.objectStore("projects").put(next);
      tx.objectStore("metadata").put({ key: "lastTimestamp", value: stamp });
    });
    return { project: next };
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<SaveTaskResponse> {
    const task = await this.taskById(id);
    const db = await this.db();
    const stamp = await this.timestamp(db);
    const next = {
      ...task,
      title: cleanString(input.title, task.title),
      owner: oneOf(input.owner, ["alex", "jordan", "morgan"], task.owner),
      status: oneOf(input.status, ["todo", "in-progress", "blocked"], task.status),
      dueWindow: oneOf(input.dueWindow, ["this-week", "next-week", "this-month"], task.dueWindow),
      updatedAt: stamp,
    };
    await this.write(["tasks", "metadata"], (tx) => {
      tx.objectStore("tasks").put(next);
      tx.objectStore("metadata").put({ key: "lastTimestamp", value: stamp });
    });
    return { task: next };
  }

  async updateProfile(id: string, input: UpdateProfileInput): Promise<ProfileResponse> {
    const profile = await this.profile(id);
    const db = await this.db();
    const stamp = await this.timestamp(db);
    const next = {
      ...profile,
      name: cleanString(input.name, profile.name),
      sector: oneOf(input.sector, ["healthcare", "finance", "education"], profile.sector),
      updatedAt: stamp,
    };
    await this.write(["profiles", "metadata"], (tx) => {
      tx.objectStore("profiles").put(next);
      tx.objectStore("metadata").put({ key: "lastTimestamp", value: stamp });
    });
    return { profile: next };
  }

  async updateOperations(id: string, input: UpdateOperationsInput): Promise<OperationsResponse> {
    const operations = await this.operations(id);
    const db = await this.db();
    const stamp = await this.timestamp(db);
    const next = {
      ...operations,
      status: oneOf(input.status, ["active", "paused"], operations.status),
      region: oneOf(input.region, ["east", "central", "west"], operations.region),
      updatedAt: stamp,
    };
    await this.write(["operations", "metadata"], (tx) => {
      tx.objectStore("operations").put(next);
      tx.objectStore("metadata").put({ key: "lastTimestamp", value: stamp });
    });
    return { operations: next };
  }

  async clear() {
    const db = await this.db();
    await this.ensureSeeded(db);
    const tx = db.transaction([...STORES], "readwrite");
    for (const store of STORES) {
      if (store !== "workspace") {
        tx.objectStore(store).clear();
      }
    }
    tx.objectStore("workspace").put({ key: WORKSPACE, initializedAt: new Date().toISOString() });
    await waitForTransaction(tx);
    this.channel?.postMessage({ type: "workspace-mutated" });
    return this.bootstrap();
  }
}

export const workspaceRepository = new WorkspaceRepository();
export const workspaceMutationChannel =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("monaco-lsp-workspace") : null;
