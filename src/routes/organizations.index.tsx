import { createFileRoute } from "@tanstack/react-router";
import { OrganizationsPage } from "../features/workspace/organizations/components/OrganizationsPage";

export const Route = createFileRoute("/organizations/")({
  ssr: false,
  component: OrganizationsPage,
});
