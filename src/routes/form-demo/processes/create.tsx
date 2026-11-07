import { createFileRoute } from "@tanstack/react-router";
import { ProcessCreatePage } from "@features/Processes/components/web/ProcessPages";

const ProcessCreateRoute = () => {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <ProcessCreatePage
      activeTab={tab === "profile" ? "profile" : "entity"}
      onActiveTabChange={(nextTab) => {
        return navigate({ search: { tab: nextTab } });
      }}
    />
  );
};

export const Route = createFileRoute("/form-demo/processes/create")({
  component: ProcessCreateRoute,
});
