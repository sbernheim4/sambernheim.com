import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CommandLink } from "@/features";

const experiments = [
  {
    to: "/experiments/terminal",
    image: "terminal",
    number: "01",
    title: "The site, in a terminal",
    category: "THE SITE / IN A TERMINAL",
    description:
      "One application, deployed to the web and the terminal. The TUI reuses the web app’s hooks, logic, and TanStack stack, with a small set of terminal-specific components.",
    preview: (
      <div className="preview-terminal">
        <span>sam@playground ~</span>
        <br />
        <br />
        <strong>❯ Explore the site</strong>
        <br />
        Read an article
        <br />
        Open the workspace
        <br />
        <br />
        <span>↑ ↓ navigate · enter open</span>
      </div>
    ),
  },
  {
    to: "/experiments/python-editor",
    image: "python-editor",
    number: "02",
    title: "A Python LSP in the browser",
    category: "MONACO / CLIENT-SIDE LSP / TY",
    description:
      "A client-side language server connects ty to Monaco. Choose an example to explore diagnostics, hover info, and completions.",
    preview: (
      <div className="preview-code">
        <span>main.py</span>
        <br />
        <br />
        <b>def</b> fibonacci(n: int) -&gt; list[int]:
        <br />
        <b>return</b> [0, 1, <u>"two"</u>]<br />
        <br />
        <small>● Expected int, found str</small>
      </div>
    ),
  },
  {
    to: "/experiments/workspace",
    image: "workspace",
    number: "03",
    title: "A demo application showing all the experiments working together",
    category: "EXAMPLE APPLICATION",
    description:
      "An example application using the form system, command palette, cycleable dates, global loading indicator, swappable view mechanism and the rest.",
    preview: (
      <div className="preview-workspace">
        <strong>Workspace</strong>
        <span>Tasks · Processes · Threads</span>
        <div>
          Prepare release notes <small>Task</small>
        </div>
        <div>
          Website refresh <small>Process</small>
        </div>
        <div>
          Review deployment <small>Thread</small>
        </div>
      </div>
    ),
  },
  {
    to: "/experiments/forms",
    image: "forms",
    number: "04",
    title: "Multiple forms, multiple endpoints",
    category: "FORMS / VALIDATION / UNDO",
    description:
      "Compose forms across endpoints with one submit, control request order, pass dependent values, update or invalidate the query cache, and undo by resubmitting previous values.",
    preview: (
      <div className="preview-form">
        <strong>Design your workshop</strong>
        <span>Workshop title</span>
        <div>Building better interfaces</div>
        <span>Session</span>
        <div>
          Choose a session <span>⌄</span>
        </div>
        <footer>Validate → Save → Undo</footer>
      </div>
    ),
  },
  {
    to: "/experiments/views",
    image: "views",
    number: "05",
    title: "The same details, three ways",
    category: "YOUR LAYOUT / YOUR PREFERENCE",
    description:
      "Tabs, a sidebar, or the whole page at once. Switch views and see which one works best for you.",
    preview: (
      <div className="preview-views">
        <div>
          <span>Tabs</span>
          <span>Sidebar</span>
          <span>Inline</span>
        </div>
        <section>
          <aside>
            Overview
            <br />
            Agenda
            <br />
            Resources
          </aside>
          <article>
            <strong>
              One page.
              <br />
              Three perspectives.
            </strong>
            <hr />
            <hr />
            <hr />
          </article>
        </section>
      </div>
    ),
  },
  {
    to: "/experiments/dates",
    image: "dates",
    number: "06",
    title: "Dates, your way",
    category: "UTC / LOCAL / RELATIVE",
    description:
      "Click a date to cycle between UTC, local time, and relative time. The choice applies across the site.",
    preview: (
      <div className="preview-dates">
        <strong>Dates, your way.</strong>
        <span>Click a date to toggle formats</span>
        <div>
          <small>Recent release</small>
          <b>3 hours ago</b>
        </div>
        <div>
          <small>Project milestone</small>
          <b>Jun 15, 2025, 12:30 PM</b>
        </div>
        <div>
          <small>Coming up</small>
          <b>in 4 days</b>
        </div>
      </div>
    ),
  },
  {
    to: "/experiments/global-loader",
    image: "loader",
    number: "07",
    title: "Global query loader",
    category: "QUERY STATE / FEEDBACK",
    description: "A small indicator appears while any query is fetching, then gets out of the way.",
    preview: (
      <div className="preview-loader">
        <span className="preview-loader-spinner" /> Loading
      </div>
    ),
  },
  {
    to: "/experiments/command-palette",
    image: "commands",
    number: "08",
    title: "A command palette that builds itself",
    category: "COMMANDS / DISCOVERABILITY",
    description:
      "Rendered links, buttons, and tabs register their actions automatically. Open the palette and try it.",
    preview: (
      <div className="preview-commands">
        <span>⌘ K</span>
        <strong>Search commands</strong>
        <small>Links · Buttons · Tabs</small>
      </div>
    ),
  },
] as const;

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
            <CommandLink className="playground-card" to={experiment.to} key={experiment.to}>
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
