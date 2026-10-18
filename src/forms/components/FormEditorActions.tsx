import { useFormEditorContext } from "../hooks/useFormEditorContext";
import "./FormEditorActions.css";

type FormActionControlsProps = {
  orchestrator?: ReturnType<typeof useFormEditorContext>["actions"]["orchestrator"];
  isSubmitting: boolean;
  disabled: boolean;
  showCancel?: boolean;
  cancelEditing: () => void;
  cancelText: string;
  saveText: string;
};

const FormActionControls = ({
  orchestrator,
  isSubmitting,
  disabled,
  showCancel,
  cancelEditing,
  cancelText,
  saveText,
}: FormActionControlsProps) => {
  return (
    <>
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
    </>
  );
};

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
  const disabled = Boolean(
    readOnly || !isEditing || isSubmitting || (preventSaveWithoutChanges && actions.isPristine),
  );
  const saveText = saveLabel ?? (saveButtonVariant === "next" ? "Next" : "Save changes");
  const cancelText = cancelLabel ?? (cancelButtonVariant === "previous" ? "Previous" : "Cancel");
  const controls = {
    orchestrator,
    isSubmitting,
    disabled,
    showCancel,
    cancelEditing,
    cancelText,
    saveText,
  };

  return (
    <div className="form-editor-actions">
      <FormActionControls
        orchestrator={orchestrator}
        isSubmitting={isSubmitting}
        disabled={disabled}
        showCancel={showCancel}
        cancelEditing={cancelEditing}
        cancelText={cancelText}
        saveText={saveText}
      />
    </div>
  );
};
