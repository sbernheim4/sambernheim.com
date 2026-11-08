import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { useAutomaticCommandAction } from "@features/Commands/commands";
import { Box, Text } from "ink";
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
  useAutomaticCommandAction({
    kind: "button",
    label: saveLabel ?? "Save changes",
    command: {group: "Actions", enabled: !disabled},
    execute: async () => {await actions.onSubmit();},
  });
  useAutomaticCommandAction({
    kind: "button",
    label: cancelLabel ?? "Cancel",
    command: showCancel ? { id: "form:cancel", group: "Actions" } : false,
    execute: cancelEditing,
  });
  useTuiInput((input, key) => {
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
