import type { ReactNode } from "react";
import { CommandLink as Link } from "@/features";
import { FormEditor } from "@/features";
import { CommandButton } from "@/features";
import { useTheme } from "@/features";
import "./Layout.css";

export const Shell = ({ children }: { children: ReactNode }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="shell">
      <nav className="nav">
        <Link to="/form-demo/tasks">Tasks</Link>
        <Link to="/form-demo/processes">Processes</Link>
        <Link to="/form-demo/threads">Threads</Link>
        <CommandButton
          className="theme-switcher"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          aria-pressed={theme === "dark"}
          onClick={toggleTheme}
        >
          {theme === "light" ? "Dark mode" : "Light mode"}
        </CommandButton>
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
