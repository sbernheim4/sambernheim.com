import { useState, type ReactNode } from "react";
import { Outlet, useLocation } from "@tanstack/react-router";
import { CommandLink } from "@/features";
import { catalog, type ComponentId } from "./catalog";
import "@/features/Workspace/components/web/DetailView/DetailView.css";
import "./component-library.css";

export const ComponentLibrary = ({ children }: { children?: ReactNode }) => {
  const location = useLocation();
  const routeComponent = location.pathname.startsWith("/experiments/components/")
    ? location.pathname.split("/").at(-1)
    : null;
  const selected = catalog.some((item) => {
    return item.id === routeComponent;
  })
    ? (routeComponent as ComponentId)
    : null;
  const [search, setSearch] = useState("");
  const matches = catalog.filter((item) => {
    return `${item.name} ${item.group}`.toLowerCase().includes(search.trim().toLowerCase());
  });

  return (
    <section className="playground-page component-library">
      <header className="playground-heading">
        <span className="playground-eyebrow">Component library / Web + TUI</span>
        <h1>One component, two renderers.</h1>
        <p>
          One shared model drives both web and TUI renderers. The two views are in sync. Reset
          examples to return both to their starting values. Explore components that work in both web
          and TUI environments. The same libraries, hooks, functions, data, state, and types drive both;
          only the rendering component changes. This includes Tanstack libraries like Query, Table, Router etc.
        </p>
      </header>
      <div className="component-library-layout">
        <aside className="component-library-sidebar">
          <label htmlFor="component-search">Find a component</label>
          <input
            id="component-search"
            type="search"
            placeholder="Search components…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />
          <nav aria-label="Components">
            {(["Forms", "Structure", "Display", "Interaction"] as const).map((group) => {
              const items = matches.filter((item) => {
                return item.group === group;
              });
              return items.length ? (
                <div key={group}>
                  <h2>{group}</h2>
                  {items.map((item) => {
                    return (
                      <CommandLink
                        key={item.id}
                        to="/experiments/components/$component"
                        params={{ component: item.id }}
                        resetScroll={false}
                        aria-current={selected === item.id ? "page" : undefined}
                        command={false}
                      >
                        {item.name}
                        <span aria-hidden="true">↗</span>
                      </CommandLink>
                    );
                  })}
                </div>
              ) : null;
            })}
            {!matches.length && <p role="status">No matching components.</p>}
          </nav>
          <small>{catalog.length} components · React DOM + Ink</small>
        </aside>
        <div className="component-library-content">
          {children ?? <Outlet />}
        </div>
      </div>
    </section>
  );
};
