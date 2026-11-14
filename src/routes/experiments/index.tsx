import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CommandLink } from "@/features";
import { experiments } from "@/features/Site/experimentsData";

const PlaygroundIndex = () => {
  return (
    <section className="playground-page">
      <header className="playground-heading playground-intro">
        <span className="playground-eyebrow">Things I’ve been working on</span>
        <h1>Take a look around.</h1>
        <p>
          Some ideas and components I’ve been working on. Click into any of the experiments to
          explore.
        </p>
      </header>
      <div className="playground-gallery">
        {experiments.map((experiment) => {
          return (
            <CommandLink
              className="playground-card"
              to={experiment.to}
              key={experiment.to}
              command={false}
            >
              <div
                className={`playground-card-image playground-preview playground-preview--${experiment.image}`}
                aria-hidden="true"
              >
                {experiment.preview}
              </div>
              <div className="playground-card-copy">
                <div className="playground-card-meta">
                  <span>{experiment.category}</span>
                  <span>{experiment.number}</span>
                </div>
                <h2>
                  {experiment.title}
                  <ArrowUpRight size={23} aria-hidden="true" />
                </h2>
                <p>{experiment.description}</p>
                <span className="playground-card-action">
                  Take a look <span aria-hidden="true">→</span>
                </span>
              </div>
            </CommandLink>
          );
        })}
      </div>
    </section>
  );
};

export const Route = createFileRoute("/experiments/")({
  head: () => {
    return {
      meta: [
        { title: "Playground — Samuel Bernheim" },
        {
          name: "description",
          content:
            "A terminal version of the site, a Python editor, connected forms, and a few ways to view the same page.",
        },
      ],
    };
  },
  component: PlaygroundIndex,
});
