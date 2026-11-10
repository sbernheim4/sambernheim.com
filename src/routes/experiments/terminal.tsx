import { createFileRoute } from "@tanstack/react-router";
import { Component, useEffect, useState, type ComponentType, type ReactNode } from "react";
import "@/features/Playground/terminal/terminal.css";

class TerminalBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="terminal-loading" role="alert">
        The terminal could not start. Reload this page to try again.
      </p>
    ) : (
      this.props.children
    );
  }
}

const TerminalPage = () => {
  const [Terminal, setTerminal] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await document.fonts.ready;
        const module = await import("@/features/Playground/terminal/BrowserTerminal");
        if (active) {
          setTerminal(() => {
            return module.default;
          });
        }
      } catch (error) {
        console.error("Unable to load site terminal:", error);
        if (active) {
          setFailed(true);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="playground-page">
      <header className="playground-heading">
        <p className="playground-eyebrow">One app, two ways to render it</p>
        <h1>The web app, in a terminal</h1>
        <p>
          This is the same application running on the web and in a terminal. A small set of
          terminal-specific components handles the interface; the hooks, business logic, and
          libraries stay the same—including TanStack Query, Router, and Form. Browse the site with
          the keyboard controls below.
        </p>
        <p className="views-playground-note terminal-playground-note">
          Browser support is still iffy. This works best in a real terminal.
        </p>
      </header>
      <div className="playground-terminal-frame">
        <div className="playground-terminal-bar">
          <span>sam@playground ~ site-tui</span>
          <span>Ink + xterm.js</span>
        </div>
        <div
          className="playground-terminal"
          aria-label="Interactive site terminal"
          onKeyDown={(event) => {
            // Let the TUI own its command shortcut while the terminal has focus.
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
              event.stopPropagation();
            }
          }}
        >
          <TerminalBoundary>
            {Terminal ? (
              <Terminal />
            ) : (
              <p className="terminal-loading" role={failed ? "alert" : "status"}>
                {failed
                  ? "The terminal could not load. Reload this page to try again."
                  : "Loading terminal…"}
              </p>
            )}
          </TerminalBoundary>
        </div>
      </div>
      <p className="playground-terminal-help">
        Click inside the terminal first. Move with <kbd>↑</kbd> / <kbd>↓</kbd> or <kbd>j</kbd> /{" "}
        <kbd>k</kbd>, press <kbd>Enter</kbd> to open something, and <kbd>Esc</kbd> to go back. Type{" "}
        <kbd>ff</kbd> for commands or <kbd>?</kbd> for help. Press <kbd>q</kbd> in a menu to return
        home.
      </p>
    </section>
  );
};

export const Route = createFileRoute("/experiments/terminal")({
  head: () => {
    return { meta: [{ title: "Terminal playground — Samuel Bernheim" }] };
  },
  component: TerminalPage,
});
