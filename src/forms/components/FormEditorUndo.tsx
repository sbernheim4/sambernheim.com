import { useState } from "react";
import { clearFormUndoTransaction, useFormUndoTransaction } from "../orchestration/undoStore";
import "./FormEditorUndo.css";

export const FormEditorUndo = () => {
  const transaction = useFormUndoTransaction();
  const [isUndoing, setIsUndoing] = useState(false);

  if (!transaction) {
    return null;
  }

  const handleUndo = async () => {
    if (isUndoing) {
      return;
    }

    setIsUndoing(true);
    clearFormUndoTransaction();

    try {
      await transaction.undo();
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div className="form-editor-undo" role="status" aria-live="polite">
      <span>Changes saved. Undo?</span>
      <button type="button" onClick={handleUndo} disabled={isUndoing}>
        {isUndoing ? "Undoing…" : "Undo"}
      </button>
    </div>
  );
};
