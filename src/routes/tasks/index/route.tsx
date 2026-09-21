import { createFileRoute } from "@tanstack/react-router";
import { TaskListPage } from "../TaskPages";
export const Route = createFileRoute("/tasks/")({ component: TaskListPage });
