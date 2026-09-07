import { useTaskWorkspace } from "../hooks/useTaskWorkspace";
import { Workspace } from "../../components/Workspace";
import { QueryState } from "../../components/QueryState";
import { Details } from "../../components/Details";
import { TaskForm } from "./TaskForm";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Folder, ArrowRight } from "lucide-react";

export const TaskPage = ({ id, isEditing = false }: { id: string; isEditing?: boolean }) => {
  const query = useTaskWorkspace(id);
  const navigate = useNavigate({ from: "/tasks/$taskId" });
  const { task, project, organization } = query;
  return (
    <Workspace
      title={task?.title ?? "Task"}
      description="Ownership, status, and delivery."
      entity="task"
      organization={organization}
      project={project}
      task={task}
    >
      <QueryState query={query} missing={!task || !project}>
        {task && project && (
          <div className="workspace-columns">
            <Details title="Task details" id={task.id} updatedAt={task.updatedAt}>
              {isEditing ? (
                <TaskForm
                  key={task.id}
                  resource={task}
                  project={project}
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
                    <dt>Title</dt>
                    <dd>{task.title}</dd>
                    <dt>Owner</dt>
                    <dd>{task.owner}</dd>
                    <dt>Status</dt>
                    <dd>{task.status}</dd>
                    <dt>Due</dt>
                    <dd>{task.dueWindow}</dd>
                  </dl>
                  <Link
                    className="workspace-button"
                    to="/tasks/$taskId"
                    params={{ taskId: task.id }}
                    search={{ isEditing: true }}
                  >
                    Edit task
                  </Link>
                </>
              )}
            </Details>
            <section className="workspace-section">
              <h2>Related resources</h2>
              <div className="related-resources">
                {organization && (
                  <Link
                    to="/organizations/$organizationId"
                    params={{ organizationId: organization.id }}
                  >
                    <Building2 size={20} />
                    <span>
                      <small>Organization</small>
                      {organization.name}
                    </span>
                    <ArrowRight size={16} />
                  </Link>
                )}
                <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                  <Folder size={20} />
                  <span>
                    <small>Project</small>
                    {project.name}
                  </span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </div>
        )}
      </QueryState>
    </Workspace>
  );
};
