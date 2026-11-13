import type { FormEditorRegionProps } from "../formTypes";
import { useFormEditorContext } from "@features/Forms/hooks/useFormEditorContext";
import { SegmentedTabList } from "@features/UI/components/web/SegmentedTabs";

export const FormEditorTabList = ({ children, className }: FormEditorRegionProps) => {
  const { viewMode } = useFormEditorContext();

  if (viewMode === "page") {
    const setSectionsOpen = (event: React.MouseEvent<HTMLButtonElement>, open: boolean) => {
      const form = event.currentTarget.closest("form");
      form?.querySelectorAll<HTMLDetailsElement>(".form-editor-page-section").forEach((section) => {
        section.open = open;
      });
    };

    return (
      <div className="form-editor-page-controls" role="group" aria-label="Page sections">
        <button
          type="button"
          onClick={(event) => {
            return setSectionsOpen(event, true);
          }}
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={(event) => {
            return setSectionsOpen(event, false);
          }}
        >
          Collapse all
        </button>
      </div>
    );
  }

  return (
    <SegmentedTabList
      className={className ?? (viewMode === "sidebar" ? "form-editor-sidebar-nav" : undefined)}
    >
      {children}
    </SegmentedTabList>
  );
};
