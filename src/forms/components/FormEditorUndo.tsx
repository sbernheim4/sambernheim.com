import { useState } from "react";
import { clearFormUndoTransaction, useFormUndoTransaction } from "../orchestration/undoStore";
import "./FormEditorUndo.css";

export const FormEditorUndo = () => {
  const transaction = useFormUndoTransaction();
  const [isUndoing, setIsUndoing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  if (!transaction) {
    return null;
  }

  const handleUndo = async () => {
    if (isUndoing) {
      return;
    }

    setIsUndoing(true);
    setError(undefined);

    try {
      await transaction.undo();
      clearFormUndoTransaction();
    } catch (undoError) {
      setError(undoError instanceof Error ? undoError.message : String(undoError));
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div className="form-editor-undo" role="status" aria-live="polite">
      <span>{error ?? "Changes saved. Undo?"}</span>
      <button type="button" onClick={handleUndo} disabled={isUndoing}>
        {isUndoing ? "Undoing…" : "Undo"}
      </button>
    </div>
  );
};
