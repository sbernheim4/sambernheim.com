import { createFileRoute } from "@tanstack/react-router";
import { OrganizationPage } from "../features/workspace/components/WorkspacePages";
const Page = () => {
  const { organizationId } = Route.useParams();
  return <OrganizationPage key={organizationId} id={organizationId} />;
};

export const Route = createFileRoute("/organizations/$organizationId")({
  ssr: false,
  component: Page,
});
