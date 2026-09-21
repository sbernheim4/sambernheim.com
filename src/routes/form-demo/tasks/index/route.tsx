import { createFileRoute } from "@tanstack/react-router";
import { TaskListPage } from "../../../tasks/TaskPages";

export const Route = createFileRoute("/form-demo/tasks/")({
  component: TaskListPage,
});
