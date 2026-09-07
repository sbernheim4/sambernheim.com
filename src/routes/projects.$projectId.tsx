import { createFileRoute } from "@tanstack/react-router";
import { ProjectPage } from "../features/workspace/projects/components/ProjectPage";

const Page = () => {
  const { projectId } = Route.useParams();
  const { isEditing } = Route.useSearch();

  return <ProjectPage key={projectId} id={projectId} isEditing={isEditing} />;
};

export const Route = createFileRoute("/projects/$projectId")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { isEditing?: boolean } => {
    if (search.isEditing === true || search.isEditing === "true") {
      return { isEditing: true };
    }
    return {};
  },
  component: Page,
});
