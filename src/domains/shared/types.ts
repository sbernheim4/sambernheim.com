export type TaskStatus = "queued" | "running" | "completed" | "failed";
export type ProcessStatus = "starting" | "running" | "stopped" | "failed";
export type ThreadStatus = "new" | "running" | "blocked" | "finished";

export type ExecutionProfile = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  runtime: string;
  region: string;
  timeoutMs: number;
  memoryLimitMb: number;
};

export type ExecutionProfileFormValues = Omit<ExecutionProfile, "timeoutMs" | "memoryLimitMb"> & {
  timeoutMs: string;
  memoryLimitMb: string;
};

export type Task = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: number;
  executionProfileId: string;
};

export type TaskFormValues = Omit<Task, "priority"> & {
  priority: string;
};

export type Process = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  taskId: string;
  command: string;
  status: ProcessStatus;
  executionProfileId: string;
};

export type Thread = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  processId: string;
  entryPoint: string;
  status: ThreadStatus;
  priority: number;
  executionProfileId: string;
};

export type ThreadFormValues = Omit<Thread, "priority"> & {
  priority: string;
};

export const emptyExecutionProfile: ExecutionProfile = {
  id: "",
  name: "",
  runtime: "node-22",
  region: "us-east",
  timeoutMs: 30000,
  memoryLimitMb: 512,
};

export const emptyTask: Task = {
  id: "",
  name: "",
  description: "",
  status: "queued",
  priority: 3,
  executionProfileId: "",
};

export const emptyProcess: Process = {
  id: "",
  name: "",
  taskId: "",
  command: "",
  status: "starting",
  executionProfileId: "",
};

export const emptyThread: Thread = {
  id: "",
  name: "",
  processId: "",
  entryPoint: "",
  status: "new",
  priority: 3,
  executionProfileId: "",
};
