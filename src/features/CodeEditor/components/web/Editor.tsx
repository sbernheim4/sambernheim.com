import type { ReactNode } from "react";
import "./Editor.css";

export const Editor = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <section className="editor-shell" aria-label={title}>
      {children}
    </section>
  );
};
