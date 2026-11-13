export const navigationDestinations = [
  { id: "home", label: "Home", path: "/" },
  { id: "blog", label: "Blog", path: "/blog" },
  { id: "experiments", label: "Experiments", path: "/experiments" },
  { id: "workspace", label: "Workspace", path: "/experiments/workspace" },
  { id: "tasks", label: "Tasks", path: "/experiments/workspace/tasks" },
  { id: "processes", label: "Processes", path: "/experiments/workspace/processes" },
  { id: "threads", label: "Threads", path: "/experiments/workspace/threads" },
  { id: "create-task", label: "Create task", path: "/experiments/workspace/tasks/create" },
  {
    id: "create-process",
    label: "Create process",
    path: "/experiments/workspace/processes/create",
  },
  { id: "create-thread", label: "Create thread", path: "/experiments/workspace/threads/create" },
] as const;
