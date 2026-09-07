import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Folder, ListTodo, Plus, Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Organization, Project, Task } from "../types";

type EntityListProps = {
  title: string;
  create?: (close: () => void) => ReactNode;
} & (
  | { kind: "organizations"; items: readonly Organization[]; projects: readonly Project[] }
  | { kind: "projects"; items: readonly Project[]; tasks: readonly Task[] }
  | { kind: "tasks"; items: readonly Task[] }
);

export const EntityList = (props: EntityListProps) => {
  const { title, kind, items, create } = props;
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const singular =
    kind === "organizations" ? "organization" : kind === "projects" ? "project" : "task";

  const filtered = items.filter((item) => {
    return ("name" in item ? item.name : item.title).toLowerCase().includes(search.toLowerCase());
  });

  const Icon = kind === "organizations" ? Building2 : kind === "projects" ? Folder : ListTodo;

  return (
    <section className="workspace-section">
      <div className="workspace-section-heading">
        <h2>
          {title} <span className="workspace-count">{items.length}</span>
        </h2>

        {create && (
          <button
            className="workspace-button"
            type="button"
            onClick={() => {
              return setCreating(!creating);
            }}
            aria-expanded={creating}
          >
            {creating ? <X size={16} /> : <Plus size={16} />}
            {creating ? "Cancel" : `New ${singular}`}
          </button>
        )}
      </div>

      {creating && (
        <div className="workspace-create">
          <h3>New {singular}</h3>
          {create?.(() => {
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
          onChange={(event) => {
            return setSearch(event.target.value);
          }}
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
                    {props.kind === "organizations"
                      ? `${
                          props.projects.filter((p) => {
                            return p.organizationId === item.id;
                          }).length
                        } projects`
                      : props.kind === "projects"
                        ? `${
                            props.tasks.filter((t) => {
                              return t.projectId === item.id;
                            }).length
                          } tasks`
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
};

const label = (value: string) => {
  return value
    .split("-")
    .map((part) => {
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
};
