import { createFileRoute } from "@tanstack/react-router";
import { ProcessListPage } from "../../../pages/processes/ProcessPages";

export const Route = createFileRoute("/form-demo/processes/")({
  component: ProcessListPage,
});
