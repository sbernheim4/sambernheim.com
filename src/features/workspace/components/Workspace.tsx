import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Organization, Project, Task } from "../types";
import { WorkspaceLayout } from "./WorkspaceLayout";

export const Workspace = ({
  title,
  description,
  children,
  entity,
  organization,
  project,
  task,
}: {
  title: string;
  description: string;
  children: ReactNode;
  entity?: "organization" | "project" | "task";
  organization?: Organization;
  project?: Project;
  task?: Task;
}) => {
  return (
    <WorkspaceLayout title={title} description={description} entity={entity}>
      <div className="workspace-body">
        <nav className="workspace-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/organizations">Organizations</Link>
          {organization && (
            <>
              <ChevronRight size={14} />
              <Link
                to="/organizations/$organizationId"
                params={{ organizationId: organization.id }}
              >
                {organization.name}
              </Link>
            </>
          )}
          {project && (
            <>
              <ChevronRight size={14} />
              <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                {project.name}
              </Link>
            </>
          )}
          {task && (
            <>
              <ChevronRight size={14} />
              <span aria-current="page">{task.title}</span>
            </>
          )}
        </nav>
        {children}
      </div>
    </WorkspaceLayout>
  );
};
