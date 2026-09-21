import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { FormEditor } from "../../../forms/components";
import "./Layout.css";

export const Shell = ({ children }: { children: ReactNode }) => {
  return (
    <main className="shell">
      <nav className="nav">
        <Link to="/form-demo/tasks">Tasks</Link>
        <Link to="/form-demo/processes">Processes</Link>
        <Link to="/form-demo/threads">Threads</Link>
      </nav>
      <section className="main">{children}</section>
    </main>
  );
};

export const DetailLayout = ({
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
      <div className="heading">
        <h1>{title}</h1>
        <Link className="primary-action" to={editTo}>
          Edit
        </Link>
      </div>
      <FormEditor.Undo />
      {children}
    </>
  );
};

export const Status = ({ value }: { value: string }) => {
  return <span className="status-pill">{value}</span>;
};

export const Loading = () => {
  return <p>Loading...</p>;
};

export const Missing = () => {
  return <p>Entity not found.</p>;
};
