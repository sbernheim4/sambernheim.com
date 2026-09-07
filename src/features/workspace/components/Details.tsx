import type { ReactNode } from "react";

export const Details = ({
  title,
  id,
  updatedAt,
  children,
}: {
  title: string;
  id: string;
  updatedAt: string;
  children: ReactNode;
}) => {
  return (
    <section className="workspace-details">
      <h2>{title}</h2>
      <p className="resource-reference">{id}</p>
      {children}
      <p className="resource-updated">Updated {new Date(updatedAt).toLocaleString()}</p>
    </section>
  );
};
