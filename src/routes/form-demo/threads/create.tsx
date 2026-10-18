import { createFileRoute } from "@tanstack/react-router";
import { ThreadCreatePage } from "../../../pages/threads/ThreadPages";

const ThreadCreateRoute = () => {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <ThreadCreatePage
      activeTab={tab === "profile" ? "profile" : "entity"}
      onActiveTabChange={(nextTab) => {
        return navigate({ search: { tab: nextTab } });
      }}
    />
  );
};

export const Route = createFileRoute("/form-demo/threads/create")({
  component: ThreadCreateRoute,
});
