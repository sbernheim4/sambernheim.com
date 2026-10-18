import { useFormEditorContext } from "../hooks/useFormEditorContext";
import { CommandButton } from "../../shared/components/CommandButton";
import type { CommandOverride } from "../../shared/commands/commands";
import "./FormEditorActions.css";

type FormActionControlsProps = {
  orchestrator?: ReturnType<typeof useFormEditorContext>["actions"]["orchestrator"];
  isSubmitting: boolean;
  disabled: boolean;
  showCancel?: boolean;
  cancelEditing: () => void;
  cancelText: string;
  saveText: string;
  saveCommand?: CommandOverride;
  cancelCommand?: CommandOverride;
};

export type FormEditorActionsProps = {
  saveCommand?: CommandOverride;
  cancelCommand?: CommandOverride;
};

const FormActionControls = ({
  orchestrator,
  isSubmitting,
  disabled,
  showCancel,
  cancelEditing,
  cancelText,
  saveText,
  saveCommand,
  cancelCommand,
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
        <CommandButton
          type="button"
          className="workspace-button"
          onClick={cancelEditing}
          disabled={isSubmitting}
          command={cancelCommand}
        >
          {cancelText}
        </CommandButton>
      )}
      <CommandButton
        type="submit"
        className="primary-action"
        disabled={disabled}
        command={saveCommand}
      >
        {isSubmitting ? "Saving…" : saveText}
      </CommandButton>
    </>
  );
};

export const FormEditorActions = ({ saveCommand, cancelCommand }: FormEditorActionsProps) => {
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
        saveCommand={saveCommand}
        cancelCommand={cancelCommand}
      />
    </div>
  );
};
