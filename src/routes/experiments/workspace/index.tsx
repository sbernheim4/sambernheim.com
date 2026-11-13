import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CommandLink } from "@/features";

const WorkspaceOverview = () => {
  return (
    <section className="playground-page workspace-experiment-page">
      <header className="workspace-overview-hero">
        <div className="workspace-overview-copy">
          <span className="playground-eyebrow">Components, composed into an example app</span>
          <h1>
            Components at work.
            <br />
            One small application.
          </h1>
          <p>
            This is first a demonstration of the site’s components, brought together in a small job
            orchestration workspace. Tasks launch processes, processes run threads, and execution
            profiles define their runtime.
          </p>
          <CommandLink className="workspace-overview-link" to="/experiments/workspace/tasks">
            Open the workspace <ArrowRight size={17} aria-hidden="true" />
          </CommandLink>
        </div>
        <div className="workspace-overview-preview" aria-label="Example job run">
          <div className="workspace-overview-preview-bar">
            <span>EXAMPLE JOB RUN</span>
            <span>RUNNING</span>
          </div>
          <div className="workspace-overview-record">
            <span className="workspace-overview-record-icon">01</span>
            <span>
              <strong>Nightly analytics</strong>
              <small>Task · Analytics runtime</small>
            </span>
            <span className="workspace-overview-status">Running</span>
          </div>
          <div className="workspace-overview-record">
            <span className="workspace-overview-record-icon">02</span>
            <span>
              <strong>Event aggregation</strong>
              <small>Process · aggregate-events</small>
            </span>
            <span className="workspace-overview-status">Running</span>
          </div>
          <div className="workspace-overview-record">
            <span className="workspace-overview-record-icon">03</span>
            <span>
              <strong>Aggregation coordinator</strong>
              <small>Thread · aggregate.main</small>
            </span>
            <span className="workspace-overview-status">Running</span>
          </div>
        </div>
      </header>

      <section className="workspace-overview-systems" aria-labelledby="workspace-systems-heading">
        <div className="workspace-overview-section-heading">
          <div>
            <span className="playground-eyebrow">Shared building blocks</span>
            <h2 id="workspace-systems-heading">Components demonstrated here.</h2>
          </div>
          <p>
            These real components power the example application. Open an experiment to explore each
            one on its own.
          </p>
        </div>
        <div className="workspace-overview-system-grid">
          <CommandLink className="workspace-overview-system" to="/experiments/forms">
            <span className="workspace-overview-system-index">01 / FORMS</span>
            <strong>Connected forms</strong>
            <span>Shared validation, dependent saves, cache updates, and undo.</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </CommandLink>
          <CommandLink
            className="workspace-overview-system"
            to="/experiments/components/$component"
            params={{ component: "table" }}
          >
            <span className="workspace-overview-system-index">02 / TABLE</span>
            <strong>TanStack Table</strong>
            <span>Filter and sort tasks, processes, and threads with the same table model.</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </CommandLink>
          <CommandLink className="workspace-overview-system" to="/experiments/command-palette">
            <span className="workspace-overview-system-index">03 / COMMANDS</span>
            <strong>Command palette</strong>
            <span>Navigation links and actions become searchable commands.</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </CommandLink>
          <CommandLink className="workspace-overview-system" to="/experiments/dates">
            <span className="workspace-overview-system-index">04 / DATES</span>
            <strong>Cycleable dates</strong>
            <span>Switch timestamps between UTC, local, and relative formats.</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </CommandLink>
          <CommandLink className="workspace-overview-system" to="/experiments/global-loader">
            <span className="workspace-overview-system-index">05 / QUERY STATE</span>
            <strong>Global loader</strong>
            <span>One indicator reflects loading across the application.</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </CommandLink>
          <CommandLink className="workspace-overview-system" to="/experiments/views">
            <span className="workspace-overview-system-index">06 / DETAIL VIEWS</span>
            <strong>Choose your layout</strong>
            <span>View the same record details in tabs, a sidebar, or inline.</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </CommandLink>
        </div>
      </section>
    </section>
  );
};

export const Route = createFileRoute("/experiments/workspace/")({ component: WorkspaceOverview });
