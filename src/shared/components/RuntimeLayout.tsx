import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import "./RuntimeLayout.css";

export const RuntimeShell = ({ children }: { children: ReactNode }) => (
  <main className="runtime-shell">
    <nav className="runtime-nav">
      <Link to="/form-demo/tasks">Tasks</Link>
      <Link to="/form-demo/processes">Processes</Link>
      <Link to="/form-demo/threads">Threads</Link>
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
}) => {
  return (
    <>
      <div className="runtime-heading">
        <h1>{title}</h1>
        <Link className="primary-action" to={editTo}>
          Edit
        </Link>
      </div>
      {children}
    </>
  );
};

export const Status = ({ value }: { value: string }) => (
  <span className="status-pill">{value}</span>
);

export const Loading = () => {
  return <p>Loading...</p>;
};

export const Missing = () => {
  return <p>Entity not found.</p>;
};
