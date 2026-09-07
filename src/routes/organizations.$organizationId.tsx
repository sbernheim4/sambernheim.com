import { createFileRoute } from "@tanstack/react-router";
import { OrganizationPage } from "../features/workspace/organizations/components/OrganizationPage";
const Page = () => {
  const { organizationId } = Route.useParams();
  const { isEditing } = Route.useSearch();
  return <OrganizationPage key={organizationId} id={organizationId} isEditing={isEditing} />;
};

export const Route = createFileRoute("/organizations/$organizationId")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { isEditing?: boolean } => {
    if (search.isEditing === true || search.isEditing === "true") {
      return { isEditing: true };
    }
    return {};
  },
  component: Page,
});
