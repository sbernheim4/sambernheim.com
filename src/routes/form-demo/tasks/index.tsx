import { createFileRoute } from "@tanstack/react-router";
import { TaskListPage } from "@features/Tasks/components/web/TaskPages";

export const Route = createFileRoute("/form-demo/tasks/")({
  component: TaskListPage,
});
