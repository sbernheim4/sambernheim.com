import { createFileRoute } from "@tanstack/react-router";
import { ProcessListPage } from "@features/Processes/components/web/ProcessPages";

export const Route = createFileRoute("/form-demo/processes/")({
  component: ProcessListPage,
});
