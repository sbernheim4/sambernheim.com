import { createFileRoute } from "@tanstack/react-router";
import { OrganizationPage } from "../features/workspace/organizations/components/OrganizationPage";
const Page = () => {
  const { organizationId } = Route.useParams();
  return <OrganizationPage key={organizationId} id={organizationId} />;
};

export const Route = createFileRoute("/organizations/$organizationId")({
  ssr: false,
  component: Page,
});
