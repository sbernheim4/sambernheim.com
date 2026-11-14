export const experiments = [
  {
    to: "/experiments/workspace",
    navLabel: "Workspace",
    image: "workspace",
    number: "04",
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
    to: "/experiments/python-editor",
    navLabel: "Python editor",
    image: "python-editor",
    number: "03",
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
    to: "/experiments/terminal",
    navLabel: "Terminal",
    image: "terminal",
    number: "02",
    title: "This site as a TUI",
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
    to: "/experiments/components",
    navLabel: "Components",
    image: "forms",
    number: "10",
    title: "A component library for web and terminal",
    category: "COMPONENTS / REACT DOM / INK",
    description:
      "Explore shared components with live web and xterm.js examples, usage documentation, and keyboard controls.",
    preview: (
      <div className="preview-form">
        <strong>Two renderers. One library.</strong>
        <span>Web</span>
        <div>
          Status <span>In progress ⌄</span>
        </div>
        <span>Terminal</span>
        <div>
          <code>Status: In progress · ↑/↓ choose</code>
        </div>
        <footer>Fields · Tabs · Sections · Dates</footer>
      </div>
    ),
  },
  {
    to: "/experiments/forms",
    navLabel: "Forms",
    image: "forms",
    number: "05",
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
    to: "/experiments/command-palette",
    navLabel: "Command palette",
    image: "commands",
    number: "09",
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
  {
    to: "/experiments/trackable",
    navLabel: "Trackable",
    image: "trackable",
    number: "01",
    title: "Using the Trackable Monad",
    category: "MAP / FLATMAP / EXECUTE",
    description:
      "An interactive version of my monad article. Transform a wrapped value, collect analytics events, and emit them when you execute the chain.",
    preview: (
      <div className="preview-trackable">
        <span>Trackable.of(2)</span>
        <strong>2 → 5 → 10 → 15</strong>
        <code>.map(addThree)</code>
        <code>.map(double)</code>
        <code>.flatMap(addFiveAndTrack)</code>
        <small>execute() → 15</small>
      </div>
    ),
  },
  {
    to: "/experiments/views",
    navLabel: "Choose your layout",
    image: "views",
    number: "06",
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
    navLabel: "Cycleable dates",
    image: "dates",
    number: "07",
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
    navLabel: "Global loader",
    image: "loader",
    number: "08",
    title: "Global query loader",
    category: "QUERY STATE / FEEDBACK",
    description: "A small indicator appears while any query is fetching, then gets out of the way.",
    preview: (
      <div className="preview-loader">
        <span className="preview-loader-spinner" /> Loading
      </div>
    ),
  },
] as const;
