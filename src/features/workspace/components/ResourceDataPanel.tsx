import type { BootstrapData } from "../types";
export const ResourceDataPanel = ({
  data,
  isError,
  isFetching,
  focus,
}: {
  data: BootstrapData | undefined;
  isError: boolean;
  isFetching: boolean;
  focus?: "organizations" | "projects" | "tasks";
}) => {
  return (
    <section className="state-panel">
      <div className="panel-heading">
        <h2>Resource Data</h2>
        <span>{isFetching ? "Fetching" : "Settled"}</span>
      </div>
      {isError ? (
        <p className="form-error">The local API route did not respond.</p>
      ) : (
        <ResourceList data={data} focus={focus} />
      )}
    </section>
  );
};
const ResourceList = ({
  data,
  focus,
}: {
  data: BootstrapData | undefined;
  focus?: "organizations" | "projects" | "tasks";
}) => {
  if (!data) {
    return <p className="empty-copy">Loading resources...</p>;
  }

  const columns = [
    {
      key: "organizations" as const,
      title: "Organizations",
      items: data.organizations.map((item) => {
        return {
          id: item.id,
          primary: item.name,
          badge: item.status,
          detail: `${label(item.sector)} · ${label(item.region)} region`,
          meta: `Updated ${formatTime(item.updatedAt)}`,
        };
      }),
    },
    {
      key: "projects" as const,
      title: "Projects",
      items: data.projects.map((item) => {
        return {
          id: item.id,
          primary: item.name,
          badge: item.priority,
          detail: `${label(item.phase)} · ${item.budget}`,
          meta: `Organization ${item.organizationId}`,
        };
      }),
    },
    {
      key: "tasks" as const,
      title: "Tasks",
      items: data.tasks.map((item) => {
        return {
          id: item.id,
          primary: item.title,
          badge: item.status,
          detail: `${label(item.owner)} · ${label(item.dueWindow)}`,
          meta: `Project ${item.projectId}`,
        };
      }),
    },
  ];

  return (
    <div className="resource-grid">
      {columns.map((column) => {
        return (
          <div
            key={column.key}
            className={focus === column.key ? "resource-column focus" : "resource-column"}
          >
            <h3>{column.title}</h3>
            {column.items.length === 0 ? (
              <p className="empty-copy">None</p>
            ) : (
              <ul className="resource-list">
                {column.items.map((item) => {
                  return (
                    <li key={item.id}>
                      <strong>{item.primary}</strong>
                      <span className="resource-badge">{label(item.badge)}</span>
                      <small>{item.detail}</small>
                      <small>{item.meta}</small>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
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
const formatTime = (value: string) => {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
};
