import { useTaskWorkspace } from "../hooks/useTaskWorkspace";
import { Workspace } from "../../components/Workspace";
import { QueryState } from "../../components/QueryState";
import { Details } from "../../components/Details";
import { TaskForm } from "./TaskForm";
import { Link } from "@tanstack/react-router";
import { Building2, Folder, ArrowRight } from "lucide-react";

export const TaskPage = ({ id }: { id: string }) => {
  const query = useTaskWorkspace(id);
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
              <TaskForm key={task.id} resource={task} project={project} />
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
