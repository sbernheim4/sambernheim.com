import { useFormEditorContext } from "../hooks/useFormEditorContext";
import "./FormEditorActions.css";

export const FormEditorActions = () => {
  const {
    actions,
    isEditing,
    readOnly,
    preventSaveWithoutChanges,
    saveLabel,
    saveButtonVariant,
    cancelEditing,
    cancelLabel,
    cancelButtonVariant,
    showCancel,
  } = useFormEditorContext();

  const orchestrator = actions.orchestrator;
  const isSubmitting = Boolean(orchestrator?.isSubmitting || actions.isSubmitting);
  const disabled =
    readOnly || !isEditing || isSubmitting || (preventSaveWithoutChanges && actions.isPristine);
  const saveText = saveLabel ?? (saveButtonVariant === "next" ? "Next" : "Save changes");
  const cancelText = cancelLabel ?? (cancelButtonVariant === "previous" ? "Previous" : "Cancel");
  return (
    <div className="form-editor-actions">
      {orchestrator && (
        <label className="form-editor-delay-control">
          <span>Step delay</span>
          <input
            min="0"
            step="100"
            type="number"
            value={orchestrator.progressDelayMs}
            onChange={(event) => {
              orchestrator.setProgressDelayMs(Number(event.target.value) || 0);
            }}
          />
          <span>ms</span>
        </label>
      )}
      {showCancel && (
        <button
          type="button"
          className="workspace-button"
          onClick={cancelEditing}
          disabled={isSubmitting}
        >
          {cancelText}
        </button>
      )}
      <button type="submit" className="primary-action" disabled={disabled}>
        {isSubmitting ? "Saving…" : saveText}
      </button>
    </div>
  );
};
