import { Outlet, createFileRoute } from "@tanstack/react-router";
import { CommandLink } from "@/features";
import { experiments } from "./experiments-data";
import "./experiments.css";

const PlaygroundLayout = () => {
  return (
    <main className="playground-shell">
      <nav className="playground-nav" aria-label="Playground">
        {experiments.map((experiment) => {
          return (
            <CommandLink key={experiment.to} to={experiment.to} command={false}>
              {experiment.navLabel}
            </CommandLink>
          );
        })}
      </nav>
      <Outlet />
    </main>
  );
};

export const Route = createFileRoute("/experiments")({ component: PlaygroundLayout });
