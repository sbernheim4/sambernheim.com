import type { ExecutionProfile, Process, Task, Thread } from "./types";

const profiles: ExecutionProfile[] = [
  {
    id: "profile-1",
    name: "Analytics runtime",
    runtime: "node-22",
    region: "us-east",
    timeoutMs: 30000,
    memoryLimitMb: 512,
  },
  {
    id: "profile-2",
    name: "Python worker",
    runtime: "python-3.13",
    region: "eu-west",
    timeoutMs: 60000,
    memoryLimitMb: 1024,
  },
  {
    id: "profile-3",
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
    name: "Nightly analytics",
    description: "Aggregate the previous day's events.",
    status: "running",
    priority: 1,
    executionProfileId: "profile-1",
  },
  {
    id: "task-2",
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
    name: "Event aggregation",
    taskId: "task-1",
    command: "aggregate-events --date yesterday",
    status: "running",
    executionProfileId: "profile-1",
  },
  {
    id: "process-2",
    name: "Report export",
    taskId: "task-1",
    command: "export-report --format parquet",
    status: "starting",
    executionProfileId: "profile-1",
  },
  {
    id: "process-3",
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
    name: "Aggregation coordinator",
    processId: "process-1",
    entryPoint: "aggregate.main",
    status: "running",
    priority: 1,
    executionProfileId: "profile-1",
  },
  {
    id: "thread-2",
    name: "Aggregation reader",
    processId: "process-1",
    entryPoint: "aggregate.readEvents",
    status: "blocked",
    priority: 2,
    executionProfileId: "profile-1",
  },
  {
    id: "thread-3",
    name: "Report serializer",
    processId: "process-2",
    entryPoint: "report.serialize",
    status: "new",
    priority: 3,
    executionProfileId: "profile-1",
  },
  {
    id: "thread-4",
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
  collection[index] = { id, ...input } as T;
  return clone(collection[index]);
};

export const createId = nextId;
