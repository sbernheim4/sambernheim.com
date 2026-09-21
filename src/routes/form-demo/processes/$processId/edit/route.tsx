import { createFileRoute } from "@tanstack/react-router";
import { ProcessEditPage } from "../../../../processes/ProcessPages";

const ProcessEditRoute = () => {
  const { processId } = Route.useParams();

  const { tab } = Route.useSearch();

  const navigate = Route.useNavigate();

  return (
    <ProcessEditPage
      id={processId}
      activeTab={tab === "profile" ? "profile" : "entity"}
      onActiveTabChange={(nextTab) => navigate({ search: { tab: nextTab } })}
    />
  );
};
export const Route = createFileRoute("/form-demo/processes/$processId/edit")({
  component: ProcessEditRoute,
});
