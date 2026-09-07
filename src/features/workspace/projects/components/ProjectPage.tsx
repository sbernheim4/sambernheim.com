import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { Workspace } from "../../components/Workspace";
import { QueryState } from "../../components/QueryState";
import { EntityList } from "../../components/EntityList";
import { Details } from "../../components/Details";
import { ProjectForm } from "./ProjectForm";
import { TaskForm } from "../../tasks/components/TaskForm";
import { Link, useNavigate } from "@tanstack/react-router";

export const ProjectPage = ({ id, isEditing = false }: { id: string; isEditing?: boolean }) => {
  const query = useProjectWorkspace(id);
  const navigate = useNavigate({ from: "/projects/$projectId" });
  const { project, organization, tasks } = query;
  return (
    <Workspace
      title={project?.name ?? "Project"}
      description="Project settings and assigned work."
      entity="project"
      organization={organization}
      project={project}
    >
      <QueryState query={query} missing={!project}>
        {project && (
          <div className="workspace-columns">
            <Details title="Project details" id={project.id} updatedAt={project.updatedAt}>
              {isEditing ? (
                <ProjectForm
                  key={project.id}
                  resource={project}
                  organizationId={project.organizationId}
                  onDiscard={() => {
                    void navigate({
                      search: (previous) => {
                        return { ...previous, isEditing: false };
                      },
                    });
                  }}
                />
              ) : (
                <>
                  <dl className="resource-details-list">
                    <dt>Name</dt>
                    <dd>{project.name}</dd>
                    <dt>Priority</dt>
                    <dd>{project.priority}</dd>
                    <dt>Phase</dt>
                    <dd>{project.phase}</dd>
                    <dt>Budget</dt>
                    <dd>{project.budget}</dd>
                  </dl>
                  <Link
                    className="workspace-button"
                    to="/projects/$projectId"
                    params={{ projectId: project.id }}
                    search={{ isEditing: true }}
                  >
                    Edit project
                  </Link>
                </>
              )}
            </Details>
            <EntityList
              title="Tasks"
              kind="tasks"
              items={tasks}
              create={
                isEditing
                  ? (close) => {
                      return <TaskForm project={project} onCreated={close} />;
                    }
                  : undefined
              }
            />
          </div>
        )}
      </QueryState>
    </Workspace>
  );
};
