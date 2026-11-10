import { createFileRoute } from "@tanstack/react-router";
import { TaskList } from "@features/Tasks/components/TaskList";

export const Route = createFileRoute("/experiments/workspace/tasks/")({
  component: TaskList,
});
