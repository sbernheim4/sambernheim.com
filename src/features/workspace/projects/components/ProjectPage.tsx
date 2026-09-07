import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { Workspace } from "../../components/Workspace";
import { QueryState } from "../../components/QueryState";
import { EntityList } from "../../components/EntityList";
import { Details } from "../../components/Details";
import { ProjectForm } from "./ProjectForm";
import { TaskForm } from "../../tasks/components/TaskForm";

export const ProjectPage = ({ id }: { id: string }) => {
  const query = useProjectWorkspace(id);
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
              <ProjectForm
                key={project.id}
                resource={project}
                organizationId={project.organizationId}
              />
            </Details>
            <EntityList
              title="Tasks"
              kind="tasks"
              items={tasks}
              create={(close) => {
                return <TaskForm project={project} onCreated={close} />;
              }}
            />
          </div>
        )}
      </QueryState>
    </Workspace>
  );
};
