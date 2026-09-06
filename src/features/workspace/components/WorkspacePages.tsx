import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Folder,
  ListTodo,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  useOrganizationsWorkspace,
  useOrganizationWorkspace,
  useProjectWorkspace,
  useTaskWorkspace,
} from "../hooks/useWorkspaceResources";
import { OrganizationForm } from "../organizations/components/OrganizationForm";
import { OrganizationWorkspaceForm } from "../organizations/components/OrganizationWorkspaceForm";
import { ProjectForm } from "../projects/components/ProjectForm";
import { TaskForm } from "../tasks/components/TaskForm";
import type { BootstrapData, Organization, Project, Task } from "../types";
import { WorkspaceLayout } from "./WorkspaceLayout";
export function OrganizationsPage() {
  const query = useOrganizationsWorkspace();
  return (
    <Workspace
      title="Organizations"
      description="Manage your accounts, projects, and day-to-day work."
    >
      <QueryState query={query}>
        {query.data && (
          <EntityList
            title="All organizations"
            kind="organizations"
            items={query.data.organizations}
            data={query.data}
            create={(close) => <OrganizationForm onCreated={close} />}
          />
        )}
      </QueryState>
    </Workspace>
  );
}

export function OrganizationPage({ id }: { id: string }) {
  const query = useOrganizationWorkspace(id);
  const organization = query.data?.organizations.find((item) => item.id === id);
  return (
    <Workspace
      title={organization?.name ?? "Organization"}
      description="Account details and projects."
      entity="organization"
      organization={organization}
    >
      <QueryState query={query} missing={!!query.data && !organization}>
        {organization && query.data && (
          <div className="workspace-columns">
            <Details
              title="Organization details"
              id={organization.id}
              updatedAt={organization.updatedAt}
            >
              <p className="workspace-edit-hint">
                Organization details are composed from the Profile and Operations records below.
              </p>
            </Details>
            <OrganizationWorkspaceForm organizationId={organization.id} />
            <EntityList
              title="Projects"
              kind="projects"
              data={query.data}
              items={query.data.projects.filter((item) => item.organizationId === organization.id)}
              create={(close) => (
                <ProjectForm organizationId={organization.id} onCreated={close} />
              )}
            />
          </div>
        )}
      </QueryState>
    </Workspace>
  );
}

export function ProjectPage({ id }: { id: string }) {
  const query = useProjectWorkspace(id);
  const project = query.data?.projects.find((item) => item.id === id);
  const organization = query.data?.organizations.find(
    (item) => item.id === project?.organizationId,
  );
  return (
    <Workspace
      title={project?.name ?? "Project"}
      description="Project settings and assigned work."
      entity="project"
      organization={organization}
      project={project}
    >
      <QueryState query={query} missing={!!query.data && !project}>
        {project && query.data && (
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
              data={query.data}
              items={query.data.tasks.filter((item) => item.projectId === project.id)}
              create={(close) => <TaskForm project={project} onCreated={close} />}
            />
          </div>
        )}
      </QueryState>
    </Workspace>
  );
}

export function TaskPage({ id }: { id: string }) {
  const query = useTaskWorkspace(id);
  const task = query.data?.tasks.find((item) => item.id === id);
  const project = query.data?.projects.find((item) => item.id === task?.projectId);
  const organization = query.data?.organizations.find((item) => item.id === task?.organizationId);
  return (
    <Workspace
      title={task?.title ?? "Task"}
      description="Ownership, status, and delivery."
      entity="task"
      organization={organization}
      project={project}
      task={task}
    >
      <QueryState query={query} missing={!!query.data && (!task || !project)}>
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
}

export function Workspace({
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
}) {
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
}

function Details({
  title,
  id,
  updatedAt,
  children,
}: {
  title: string;
  id: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <section className="workspace-details">
      <h2>{title}</h2>
      <p className="resource-reference">{id}</p>
      {children}
      <p className="resource-updated">Updated {new Date(updatedAt).toLocaleString()}</p>
    </section>
  );
}

export function QueryState({
  query,
  missing,
  children,
}: {
  query: ReturnType<typeof useOrganizationsWorkspace>;
  missing?: boolean;
  children: ReactNode;
}) {
  if (query.isPending)
    return (
      <p className="workspace-empty" role="status">
        Loading resources...
      </p>
    );
  if (query.isError)
    return (
      <div className="workspace-empty" role="alert">
        <h2>Unable to load resources</h2>
        <p>Please try again.</p>
        <button type="button" className="workspace-button" onClick={() => void query.refetch()}>
          Retry
        </button>
      </div>
    );
  if (missing)
    return (
      <div className="workspace-empty">
        <h2>Resource not found</h2>
        <p>This resource may have been removed.</p>
        <Link to="/organizations">Back to organizations</Link>
      </div>
    );
  return children;
}

export function EntityList({
  title,
  kind,
  items,
  data,
  create,
}: {
  title: string;
  kind: keyof BootstrapData;
  items: Array<Organization | Project | Task>;
  data: BootstrapData;
  create: (close: () => void) => ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const singular =
    kind === "organizations" ? "organization" : kind === "projects" ? "project" : "task";
  const filtered = items.filter((item) =>
    ("name" in item ? item.name : item.title).toLowerCase().includes(search.toLowerCase()),
  );
  const Icon = kind === "organizations" ? Building2 : kind === "projects" ? Folder : ListTodo;
  return (
    <section className="workspace-section">
      <div className="workspace-section-heading">
        <h2>
          {title} <span className="workspace-count">{items.length}</span>
        </h2>
        <button
          className="workspace-button"
          type="button"
          onClick={() => setCreating(!creating)}
          aria-expanded={creating}
        >
          {creating ? <X size={16} /> : <Plus size={16} />}
          {creating ? "Cancel" : `New ${singular}`}
        </button>
      </div>
      {creating && (
        <div className="workspace-create">
          <h3>New {singular}</h3>
          {create(() => {
            setCreating(false);
            setSearch("");
          })}
        </div>
      )}
      <label className="workspace-search">
        <Search size={17} />
        <input
          type="search"
          aria-label={`Search ${kind}`}
          placeholder={`Search ${kind}...`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      {filtered.length === 0 ? (
        <div className="workspace-empty">
          <Icon size={28} />
          <h3>{items.length === 0 ? `No ${kind} yet` : "No matches"}</h3>
          <p>
            {items.length === 0 ? `Create a ${singular} to get started.` : "Try a different name."}
          </p>
        </div>
      ) : (
        <ul className="workspace-list">
          {filtered.map((item) => {
            const content = (
              <>
                <span className="workspace-resource-icon">
                  <Icon size={20} />
                </span>
                <span className="workspace-row-main">
                  <strong>{"name" in item ? item.name : item.title}</strong>
                  <small>
                    {"sector" in item
                      ? `${label(item.sector)} / ${label(item.region)}`
                      : "phase" in item
                        ? `${label(item.phase)} / ${item.budget}`
                        : `${label(item.owner)} / ${label(item.dueWindow)}`}
                  </small>
                </span>
                <span className="workspace-row-meta">
                  <span className="workspace-badge">
                    {label("priority" in item ? item.priority : item.status)}
                  </span>
                  <small>
                    {kind === "organizations"
                      ? `${data.projects.filter((p) => p.organizationId === item.id).length} projects`
                      : kind === "projects"
                        ? `${data.tasks.filter((t) => t.projectId === item.id).length} tasks`
                        : ""}
                  </small>
                </span>
                <ArrowRight size={17} className="workspace-row-arrow" />
              </>
            );
            return (
              <li key={item.id}>
                {kind === "organizations" ? (
                  <Link to="/organizations/$organizationId" params={{ organizationId: item.id }}>
                    {content}
                  </Link>
                ) : kind === "projects" ? (
                  <Link to="/projects/$projectId" params={{ projectId: item.id }}>
                    {content}
                  </Link>
                ) : (
                  <Link to="/tasks/$taskId" params={{ taskId: item.id }}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function label(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
