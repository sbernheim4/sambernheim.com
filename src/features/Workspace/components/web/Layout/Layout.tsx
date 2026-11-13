import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
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
        <div className="nav-links">
          <Link to="/experiments/workspace/tasks">Tasks</Link>
          <Link to="/experiments/workspace/processes">Processes</Link>
          <Link to="/experiments/workspace/threads">Threads</Link>
        </div>
        <div className="nav-footer">
          <CommandButton
            className="theme-switcher"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            aria-pressed={theme === "dark"}
            command={false}
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <Moon size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Sun size={16} strokeWidth={2} aria-hidden="true" />
            )}
            <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </CommandButton>
        </div>
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
      <div className="heading detail-heading">
        <div className="heading-copy">
          <span className="eyebrow">Workspace record</span>
          <h1>{title}</h1>
        </div>
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
  return (
    <span className="status-pill" data-status={value}>
      {value}
    </span>
  );
};

export const Loading = () => {
  return <p>Loading...</p>;
};

export const Missing = () => {
  return <p>Entity not found.</p>;
};
