import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useClearEntities } from "../hooks/useClearEntities";

export function WorkspaceLayout({
  title,
  description,
  children,
  entity,
}: {
  title: string;
  description: string;
  children: ReactNode;
  entity?: "organization" | "project" | "task" | "flow";
}) {
  const clear = useClearEntities();

  return (
    <main className={`forms-shell${entity ? ` forms-shell--${entity}` : ""}`}>
      <header className="forms-topbar">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <nav className="forms-nav" aria-label="Form examples">
          <Link to="/" className="forms-link">
            Home
          </Link>
          <Link to="/forms" className="forms-link">
            Forms
          </Link>
          <button
            type="button"
            className="clear-entities"
            disabled={clear.isDisabled}
            onClick={clear.clear}
          >
            {clear.isPending ? "Clearing..." : "Clear all entities"}
          </button>
        </nav>
      </header>
      {clear.isError && (
        <p className="form-error" role="alert">
          Could not clear entities. Please try again.
        </p>
      )}
      {clear.isSuccess && (
        <p className="clear-status" role="status">
          All entities cleared.
        </p>
      )}
      <fieldset className="forms-content" disabled={clear.isPending}>
        {children}
      </fieldset>
    </main>
  );
}
