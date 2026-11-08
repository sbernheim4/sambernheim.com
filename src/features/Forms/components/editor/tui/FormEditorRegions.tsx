import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { Box, Text } from "ink";
import type { ReactNode } from "react";
import type { FormEditorRegionProps } from "../formTypes";
import type { PersistedDraftController } from "../../../hooks/usePersistedFormData";
import { useFormEditorContext } from "../../../hooks/useFormEditorContext";
import { clearFormUndoTransaction, useFormUndoTransaction } from "../../../orchestration/undoStore";
import { useState } from "react";

export const Region = ({ children }: FormEditorRegionProps) => {
  return <Box flexDirection="column">{children}</Box>;
};
export const FormEditorTitle = ({ children }: { children: ReactNode }) => {
  return (
    <Text bold color="cyan">
      {children}
    </Text>
  );
};
export const FormEditorError = () => {
  const { actions } = useFormEditorContext();
  const errors = [...(actions.validationErrors ?? []), ...(actions.submitErrors ?? [])];
  return errors.length ? (
    <Box flexDirection="column">
      {errors.map((error, index) => {
        return (
          <Text key={index} color="red">
            {String(error)}
          </Text>
        );
      })}
    </Box>
  ) : null;
};
export const FormEditorDraftBanner = ({ draft }: { draft: PersistedDraftController }) => {
  useTuiInput((input) => {
    if (!draft.hasDraft) {
      return;
    }
    if (input === "r") {
      draft.restore();
    }
    if (input === "d") {
      draft.discard();
    }
  });
  return draft.hasDraft ? (
    <Text color="yellow">Unsaved form data available · r restore · d discard</Text>
  ) : null;
};
export const FormEditorUndo = () => {
  const transaction = useFormUndoTransaction();
  const [error, setError] = useState<string>();
  useTuiInput((input) => {
    if (!transaction || input !== "u") {
      return;
    }
    void transaction
      .undo()
      .then(() => {
        return clearFormUndoTransaction();
      })
      .catch((reason: unknown) => {
        return setError(String(reason));
      });
  });
  return transaction ? (
    <Text color={error ? "red" : "yellow"}>{error ?? "Changes saved · u undo"}</Text>
  ) : null;
};
