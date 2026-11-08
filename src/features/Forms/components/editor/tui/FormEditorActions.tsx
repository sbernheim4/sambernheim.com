import { Box, Text, useInput } from "ink";
import { useFormEditorContext } from "../../../hooks/useFormEditorContext";
import { useFieldFocus } from "../../fields/tui/FieldFocus";
import type { FormEditorActionsProps } from "../FormEditorActions";

export const FormEditorActions = (_props: FormEditorActionsProps) => {
  const {
    actions,
    isEditing,
    readOnly,
    preventSaveWithoutChanges,
    saveLabel,
    saveButtonVariant,
    cancelLabel,
    cancelButtonVariant,
    showCancel,
    cancelEditing,
  } = useFormEditorContext();
  const { focused } = useFieldFocus();
  const submitting = actions.isSubmitting || Boolean(actions.orchestrator?.isSubmitting);
  const disabled =
    readOnly ||
    !isEditing ||
    submitting ||
    (preventSaveWithoutChanges && actions.isPristine) ||
    !actions.canSubmit;
  useInput((input, key) => {
    if (!focused) {
      return;
    }
    if (key.return && !disabled) {
      void actions.onSubmit();
    }
    if (input === "c" && showCancel && !submitting) {
      cancelEditing();
    }
  });
  return (
    <Box flexDirection="column" marginTop={1}>
      {actions.orchestrator && (
        <Text dimColor>Step delay: {actions.orchestrator.progressDelayMs} ms</Text>
      )}
      <Text inverse={focused} color={disabled ? "gray" : "green"}>
        {submitting
          ? "Saving…"
          : (saveLabel ?? (saveButtonVariant === "next" ? "Next" : "Save changes"))}
        {focused ? " · Enter" : ""}
      </Text>
      {showCancel && (
        <Text dimColor>
          {cancelLabel ?? (cancelButtonVariant === "previous" ? "Previous" : "Cancel")}
          {focused ? " · c" : ""}
        </Text>
      )}
    </Box>
  );
};
