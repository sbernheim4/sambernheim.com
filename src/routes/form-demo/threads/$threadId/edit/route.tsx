import { createFileRoute } from "@tanstack/react-router";
import { ThreadEditPage } from "../../../../threads/-ThreadPages";

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
export const Route = createFileRoute("/form-demo/threads/$threadId/edit")({
  component: ThreadEditRoute,
});
