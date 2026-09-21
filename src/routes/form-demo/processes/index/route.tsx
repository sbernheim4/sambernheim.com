import { createFileRoute } from "@tanstack/react-router";
import { ProcessListPage } from "../../../processes/ProcessPages";

export const Route = createFileRoute("/form-demo/processes/")({
  component: ProcessListPage,
});
