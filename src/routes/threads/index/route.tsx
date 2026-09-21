import { createFileRoute } from "@tanstack/react-router";
import { ThreadListPage } from "../ThreadPages";
export const Route = createFileRoute("/threads/")({ component: ThreadListPage });
