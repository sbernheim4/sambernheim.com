import { createFileRoute } from "@tanstack/react-router";
import { CycleableDateTime } from "@/features";

const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const todos = [
  { title: "Reply to design feedback", due: new Date(now + 3 * 60 * 60 * 1000), priority: "Today" },
  { title: "Review the pull request", due: new Date(now + day), priority: "Next up" },
  { title: "Send the project update", due: new Date(now + 3 * day), priority: "This week" },
  { title: "Renew the staging certificate", due: new Date(now + 8 * day), priority: "Coming up" },
];
const jobs = [
  {
    name: "Nightly analytics",
    description: "Aggregated yesterday’s events",
    ran: new Date(now - 2 * 60 * 60 * 1000),
    status: "Succeeded",
  },
  {
    name: "Search index refresh",
    description: "Indexed 1,284 updated records",
    ran: new Date(now - 7 * 60 * 60 * 1000),
    status: "Succeeded",
  },
  {
    name: "Report export",
    description: "Generated the weekly usage report",
    ran: new Date(now - 26 * 60 * 60 * 1000),
    status: "Succeeded",
  },
];
const events = [
  { name: "Design review", detail: "Product team · 30 minutes", starts: new Date(now + 2 * day) },
  { name: "Launch planning", detail: "Project room · 45 minutes", starts: new Date(now + 5 * day) },
  { name: "Quarterly check-in", detail: "Video call · 1 hour", starts: new Date(now + 12 * day) },
];

const DatesPlayground = () => {
  return (
    <section className="playground-page dates-playground">
      <header className="playground-heading">
        <h1>Dates, your way.</h1>
        <p>
          Click any date to cycle between UTC, local, and relative time. Hover to see which format
          is selected. The format you choose is used across the site.
        </p>
      </header>
      <p className="views-playground-note">
        Click a date or time to cycle through UTC → local → relative.
      </p>
      <div className="dates-examples-grid">
        <section className="forms-playground-card">
          <h2>Todo list</h2>
          <ul className="dates-example-list dates-todo-list">
            {todos.map((todo) => {
              return (
                <li key={todo.title}>
                  <div>
                    <strong>{todo.title}</strong>
                    <small>{todo.priority}</small>
                  </div>
                  <CycleableDateTime value={todo.due} />
                </li>
              );
            })}
          </ul>
        </section>
        <section className="forms-playground-card">
          <h2>Recent runs</h2>
          <div className="dates-table-wrap">
            <table className="dates-jobs-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Description</th>
                  <th>Ran</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  return (
                    <tr key={job.name}>
                      <th scope="row">
                        {job.name}
                        <small>{job.status}</small>
                      </th>
                      <td>{job.description}</td>
                      <td>
                        <CycleableDateTime value={job.ran} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <section className="forms-playground-card dates-example-events">
          <h2>Upcoming events</h2>
          <ul className="dates-example-list dates-event-timeline">
            {events.map((event) => {
              return (
                <li key={event.name}>
                  <div>
                    <strong>{event.name}</strong>
                    <small>{event.detail}</small>
                  </div>
                  <CycleableDateTime value={event.starts} />
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </section>
  );
};

export const Route = createFileRoute("/experiments/dates")({
  head: () => {
    return { meta: [{ title: "Cycleable dates — Samuel Bernheim" }] };
  },
  component: DatesPlayground,
});
