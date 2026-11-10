import { createFileRoute } from "@tanstack/react-router";
import { ThreadEditPage } from "@features/Threads/components/ThreadForms";

const ThreadEditRoute = () => {
  const { threadId } = Route.useParams();

  const { tab } = Route.useSearch();

  const navigate = Route.useNavigate();

  return (
    <ThreadEditPage
      id={threadId}
      activeTab={tab === "profile" ? "profile" : "entity"}
      onActiveTabChange={(nextTab) => {
        return navigate({ search: { tab: nextTab } });
      }}
    />
  );
};
export const Route = createFileRoute("/experiments/workspace/threads/$threadId/edit")({
  component: ThreadEditRoute,
});
