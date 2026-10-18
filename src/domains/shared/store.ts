import type { ExecutionProfile, Process, Task, Thread } from "./types";

const profiles: ExecutionProfile[] = [
  {
    id: "profile-1",
    createdAt: "2026-09-01T08:15:00.000Z",
    updatedAt: "2026-10-12T14:30:00.000Z",
    name: "Analytics runtime",
    runtime: "node-22",
    region: "us-east",
    timeoutMs: 30000,
    memoryLimitMb: 512,
  },
  {
    id: "profile-2",
    createdAt: "2026-09-05T10:45:00.000Z",
    updatedAt: "2026-10-10T09:20:00.000Z",
    name: "Python worker",
    runtime: "python-3.13",
    region: "eu-west",
    timeoutMs: 60000,
    memoryLimitMb: 1024,
  },
  {
    id: "profile-3",
    createdAt: "2026-09-12T16:05:00.000Z",
    updatedAt: "2026-10-08T18:10:00.000Z",
    name: "Low-latency thread",
    runtime: "rust-1.88",
    region: "us-west",
    timeoutMs: 10000,
    memoryLimitMb: 256,
  },
];

const tasks: Task[] = [
  {
    id: "task-1",
    createdAt: "2026-10-01T06:30:00.000Z",
    updatedAt: "2026-10-18T11:42:00.000Z",
    name: "Nightly analytics",
    description: "Aggregate the previous day's events.",
    status: "running",
    priority: 1,
    executionProfileId: "profile-1",
  },
  {
    id: "task-2",
    createdAt: "2026-10-04T13:20:00.000Z",
    updatedAt: "2026-10-16T15:05:00.000Z",
    name: "Search indexing",
    description: "Refresh the document search index.",
    status: "queued",
    priority: 2,
    executionProfileId: "profile-2",
  },
];

const processes: Process[] = [
  {
    id: "process-1",
    createdAt: "2026-10-18T06:31:00.000Z",
    updatedAt: "2026-10-18T11:40:00.000Z",
    name: "Event aggregation",
    taskId: "task-1",
    command: "aggregate-events --date yesterday",
    status: "running",
    executionProfileId: "profile-1",
  },
  {
    id: "process-2",
    createdAt: "2026-10-18T06:32:00.000Z",
    updatedAt: "2026-10-18T10:15:00.000Z",
    name: "Report export",
    taskId: "task-1",
    command: "export-report --format parquet",
    status: "starting",
    executionProfileId: "profile-1",
  },
  {
    id: "process-3",
    createdAt: "2026-10-16T15:00:00.000Z",
    updatedAt: "2026-10-17T22:18:00.000Z",
    name: "Index writer",
    taskId: "task-2",
    command: "write-index --shard all",
    status: "stopped",
    executionProfileId: "profile-2",
  },
];

const threads: Thread[] = [
  {
    id: "thread-1",
    createdAt: "2026-10-18T06:31:10.000Z",
    updatedAt: "2026-10-18T11:39:00.000Z",
    name: "Aggregation coordinator",
    processId: "process-1",
    entryPoint: "aggregate.main",
    status: "running",
    priority: 1,
    executionProfileId: "profile-1",
  },
  {
    id: "thread-2",
    createdAt: "2026-10-18T06:31:20.000Z",
    updatedAt: "2026-10-18T11:38:00.000Z",
    name: "Aggregation reader",
    processId: "process-1",
    entryPoint: "aggregate.readEvents",
    status: "blocked",
    priority: 2,
    executionProfileId: "profile-1",
  },
  {
    id: "thread-3",
    createdAt: "2026-10-18T06:32:10.000Z",
    updatedAt: "2026-10-18T10:14:00.000Z",
    name: "Report serializer",
    processId: "process-2",
    entryPoint: "report.serialize",
    status: "new",
    priority: 3,
    executionProfileId: "profile-1",
  },
  {
    id: "thread-4",
    createdAt: "2026-10-16T15:00:10.000Z",
    updatedAt: "2026-10-17T22:17:00.000Z",
    name: "Shard writer",
    processId: "process-3",
    entryPoint: "index.writeShard",
    status: "finished",
    priority: 2,
    executionProfileId: "profile-2",
  },
];

const clone = <T>(value: T): T => {
  return structuredClone(value);
};
const pause = () => {
  return Promise.resolve();
};
const nextId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
};

export const store = {
  async createTask(input: Omit<Task, "id"> & Partial<Pick<Task, "id">>) {
    await pause();
    const task = { id: nextId("task"), ...input };
    tasks.push(task);
    return clone(task);
  },
  async listTasks() {
    await pause();
    return clone(tasks);
  },
  async getTask(id: string) {
    await pause();
    return clone(
      tasks.find((item) => {
        return item.id === id;
      }),
    );
  },
  async updateTask(id: string, input: Omit<Task, "id">) {
    await pause();
    return update(tasks, id, input);
  },
  async createProcess(input: Omit<Process, "id"> & Partial<Pick<Process, "id">>) {
    await pause();
    const process = { id: nextId("process"), ...input };
    processes.push(process);
    return clone(process);
  },
  async listProcesses(taskId?: string) {
    await pause();
    return clone(
      taskId
        ? processes.filter((item) => {
            return item.taskId === taskId;
          })
        : processes,
    );
  },
  async getProcess(id: string) {
    await pause();
    return clone(
      processes.find((item) => {
        return item.id === id;
      }),
    );
  },
  async updateProcess(id: string, input: Omit<Process, "id">) {
    await pause();
    return update(processes, id, input);
  },
  async createThread(input: Omit<Thread, "id"> & Partial<Pick<Thread, "id">>) {
    await pause();
    const thread = { id: nextId("thread"), ...input };
    threads.push(thread);
    return clone(thread);
  },
  async listThreads(processId?: string) {
    await pause();
    return clone(
      processId
        ? threads.filter((item) => {
            return item.processId === processId;
          })
        : threads,
    );
  },
  async getThread(id: string) {
    await pause();
    return clone(
      threads.find((item) => {
        return item.id === id;
      }),
    );
  },
  async updateThread(id: string, input: Omit<Thread, "id">) {
    await pause();
    return update(threads, id, input);
  },
  async createProfile(input: Omit<ExecutionProfile, "id"> & Partial<Pick<ExecutionProfile, "id">>) {
    await pause();
    const profile = { id: nextId("profile"), ...input };
    profiles.push(profile);
    return clone(profile);
  },
  async getProfile(id: string) {
    await pause();
    return clone(
      profiles.find((item) => {
        return item.id === id;
      }),
    );
  },
  async updateProfile(id: string, input: Omit<ExecutionProfile, "id">) {
    await pause();
    return update(profiles, id, input);
  },
};

const update = <T extends { id: string }>(collection: T[], id: string, input: Omit<T, "id">) => {
  const index = collection.findIndex((item) => {
    return item.id === id;
  });
  if (index < 0) {
    throw new Error(`Record ${id} was not found.`);
  }
  collection[index] = {
    id,
    ...input,
    updatedAt: new Date().toISOString(),
  } as unknown as T;
  return clone(collection[index]);
};

export const createId = nextId;
