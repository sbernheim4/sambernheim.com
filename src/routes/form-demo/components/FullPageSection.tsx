import type { ReactNode } from "react";
import "./FullPageSection.css";

export const FullPageSection = ({
  label,
  children,
  className,
  dataState,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  dataState?: string;
}) => {
  return (
    <details
      className={className ? `full-page-section ${className}` : "full-page-section"}
      data-state={dataState}
      open
    >
      <summary className="full-page-section-heading">{label}</summary>
      {children}
    </details>
  );
};
