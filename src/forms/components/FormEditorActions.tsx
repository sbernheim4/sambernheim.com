import { useFormEditorContext } from "../hooks/useFormEditorContext";

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
  const disabled =
    readOnly ||
    !isEditing ||
    actions.isSubmitting ||
    (preventSaveWithoutChanges && actions.isPristine);
  const saveText = saveLabel ?? (saveButtonVariant === "next" ? "Next" : "Save changes");
  const cancelText = cancelLabel ?? (cancelButtonVariant === "previous" ? "Previous" : "Cancel");
  return (
    <div className="form-editor-actions">
      {showCancel && (
        <button
          type="button"
          className="workspace-button"
          onClick={cancelEditing}
          disabled={actions.isSubmitting}
        >
          {cancelText}
        </button>
      )}
      <button type="submit" className="primary-action" disabled={disabled}>
        {actions.isSubmitting ? "Saving…" : saveText}
      </button>
    </div>
  );
};
