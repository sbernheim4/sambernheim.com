import type { ReactNode } from "react";

export const DetailSection = ({
  label,
  children,
  collapsible = false,
  showLabel = true,
}: {
  label: string;
  children: ReactNode;
  collapsible?: boolean;
  showLabel?: boolean;
}) => {
  const heading = showLabel ? <span className="eyebrow">{label}</span> : null;

  if (collapsible) {
    return (
      <details className="detail-section detail-section--collapsible" open>
        <summary className="detail-section-heading">{heading}</summary>
        <div className="detail-section-content">{children}</div>
      </details>
    );
  }

  return (
    <section className="detail-section">
      {heading ? <div className="detail-section-heading">{heading}</div> : null}
      <div className="detail-section-content">{children}</div>
    </section>
  );
};
