import type { ReactNode } from "react";
import { useDetailSectionModel } from "../../../hooks/useDetailSectionModel";

export const DetailSection = ({
  label,
  children,
  collapsible = false,
  showLabel = true,
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  label: string;
  children: ReactNode;
  collapsible?: boolean;
  showLabel?: boolean;
}) => {
  const disclosure = useDetailSectionModel({ open, onOpenChange });
  const heading = showLabel ? <span className="eyebrow">{label}</span> : null;

  if (collapsible) {
    return (
      <details
        className="detail-section detail-section--collapsible"
        open={disclosure.isOpen}
        onToggle={(event) => {
          const nextOpen = event.currentTarget.open;
          if (nextOpen !== disclosure.isOpen) {
            disclosure.setOpen(nextOpen);
          }
        }}
      >
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
