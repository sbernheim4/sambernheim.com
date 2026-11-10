import { Outlet, createFileRoute } from "@tanstack/react-router";
import { CommandLink } from "@/features";
import "./experiments.css";

const PlaygroundLayout = () => {
  return (
    <main className="playground-shell">
      <nav className="playground-nav" aria-label="Playground">
        <CommandLink to="/experiments" activeOptions={{ exact: true }}>
          All experiments
        </CommandLink>
        <CommandLink to="/experiments/terminal">Terminal</CommandLink>
        <CommandLink to="/experiments/python-editor">Python editor</CommandLink>
        <CommandLink to="/experiments/forms">Forms</CommandLink>
        <CommandLink to="/experiments/workspace">Workspace</CommandLink>
        <CommandLink to="/experiments/views">Choose your layout</CommandLink>
        <CommandLink to="/experiments/dates">Cycleable dates</CommandLink>
        <CommandLink to="/experiments/global-loader">Global loader</CommandLink>
        <CommandLink to="/experiments/command-palette">Command palette</CommandLink>
      </nav>
      <Outlet />
    </main>
  );
};

export const Route = createFileRoute("/experiments")({ component: PlaygroundLayout });
