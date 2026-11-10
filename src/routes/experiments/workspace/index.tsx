import { createFileRoute } from "@tanstack/react-router";
import { CommandLink } from "@/features";

const WorkspaceOverview = () => {
  return (
    <section className="playground-page workspace-experiment-page">
      <header className="playground-heading">
        <h1>A demo of the tools working together.</h1>
        <p>
          An example application comprised of all the experiments to show what they look like all
          together.
        </p>
      </header>
      <CommandLink className="workspace-overview-link" to="/experiments/workspace/tasks">
        Go to application <span aria-hidden="true">→</span>
      </CommandLink>
    </section>
  );
};

export const Route = createFileRoute("/experiments/workspace/")({ component: WorkspaceOverview });
