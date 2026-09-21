import { createFileRoute } from "@tanstack/react-router";
import { ProcessListPage } from "../ProcessPages";
export const Route = createFileRoute("/processes/")({ component: ProcessListPage });
