import { createFileRoute } from "@tanstack/react-router";
import { ThreadListPage } from "../../../pages/threads/ThreadPages";

export const Route = createFileRoute("/form-demo/threads/")({
  component: ThreadListPage,
});
