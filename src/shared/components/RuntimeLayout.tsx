import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import "./RuntimeLayout.css";

export const RuntimeShell = ({ children }: { children: ReactNode }) => (
  <main className="runtime-shell">
    <nav className="runtime-nav">
      <Link to="/tasks">Tasks</Link>
      <Link to="/processes">Processes</Link>
      <Link to="/threads">Threads</Link>
    </nav>
    <section className="runtime-main">{children}</section>
  </main>
);

export const RuntimeDetailLayout = ({
  title,
  children,
  editTo,
}: {
  title: string;
  children: ReactNode;
  editTo: string;
}) => (
  <RuntimeShell>
    <div className="runtime-heading">
      <h1>{title}</h1>
      <Link className="primary-action" to={editTo}>
        Edit
      </Link>
    </div>
    {children}
  </RuntimeShell>
);

export const Status = ({ value }: { value: string }) => (
  <span className="status-pill">{value}</span>
);

export const Loading = () => (
  <RuntimeShell>
    <p>Loading...</p>
  </RuntimeShell>
);
export const Missing = () => (
  <RuntimeShell>
    <p>Entity not found.</p>
  </RuntimeShell>
);
