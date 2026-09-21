import type { FormEditorRegionProps } from "./formTypes";
import type { PersistedDraftController } from "../hooks/usePersistedFormData";

export const FormEditorContent = ({ children, className }: FormEditorRegionProps) => (
  <div className={className ?? "form-editor-content"}>{children}</div>
);

export const FormEditorDraftBanner = ({ draft }: { draft: PersistedDraftController }) => {
  if (!draft.hasDraft) {
    return null;
  }
  return (
    <div className="form-editor-draft-banner" role="status">
      <span>
        Unsaved form data is available
        {draft.savedAt ? ` from ${new Date(draft.savedAt).toLocaleString()}` : ""}.
      </span>
      <button type="button" className="workspace-button" onClick={draft.restore}>
        Restore draft
      </button>
      <button type="button" className="workspace-button" onClick={draft.discard}>
        Discard draft
      </button>
    </div>
  );
};
