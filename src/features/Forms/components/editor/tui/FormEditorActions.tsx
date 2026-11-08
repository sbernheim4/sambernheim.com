import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { useAutomaticCommandAction } from "@features/Commands/commands";
import { Box, Text } from "ink";
import { useFormEditorContext } from "../../../hooks/useFormEditorContext";
import { useFieldFocus } from "../../fields/tui/FieldFocus";
import type { FormEditorActionsProps } from "../FormEditorActions";

const StepDelayControl = ({
  run,
}: {
  run: ReturnType<typeof useFormEditorContext>["actions"]["orchestrator"];
}) => {
  const { focused, ref } = useFieldFocus(Boolean(run), true);
  useTuiInput((input, key) => {
    if (!focused || !run) {
      return;
    }
    if (key.leftArrow || key.downArrow || input === "h" || input === "k") {
      run.setProgressDelayMs(Math.max(0, run.progressDelayMs - 100));
    } else if (key.rightArrow || key.upArrow || input === "l" || input === "j") {
      run.setProgressDelayMs(run.progressDelayMs + 100);
    }
  });
  return run ? (
    <Box ref={ref}>
      <Text inverse={focused} dimColor>
        Step delay: {run.progressDelayMs} ms
      </Text>
    </Box>
  ) : null;
};

const SaveAction = ({
  actions,
  disabled,
  submitting,
  label,
}: {
  actions: ReturnType<typeof useFormEditorContext>["actions"];
  disabled: boolean;
  submitting: boolean;
  label: string;
}) => {
  const { focused, ref } = useFieldFocus();
  useTuiInput((_, key) => {
    if (focused && key.return && !disabled) {
      void actions.onSubmit();
    }
  });
  return (
    <Box ref={ref}>
      <Text inverse={focused} color={disabled ? "gray" : "green"}>
        {submitting ? "Saving…" : label}
        {focused ? " · Enter" : ""}
      </Text>
    </Box>
  );
};

const CancelAction = ({
  enabled,
  submitting,
  label,
  onCancel,
}: {
  enabled: boolean;
  submitting: boolean;
  label: string;
  onCancel: () => void;
}) => {
  const { focused, ref } = useFieldFocus(enabled);
  useTuiInput((input, key) => {
    if (focused && key.return && enabled && !submitting) {
      onCancel();
    } else if (focused && input === "c" && enabled && !submitting) {
      onCancel();
    }
  });
  return enabled ? (
    <Box ref={ref}>
      <Text inverse={focused} dimColor>
        {label}
        {focused ? " · Enter" : ""}
      </Text>
    </Box>
  ) : null;
};

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
    command: { group: "Actions", enabled: !disabled },
    execute: async () => {
      await actions.onSubmit();
    },
  });
  useAutomaticCommandAction({
    kind: "button",
    label: cancelLabel ?? "Cancel",
    command: showCancel ? { id: "form:cancel", group: "Actions" } : false,
    execute: cancelEditing,
  });
  return (
    <Box flexDirection="column" marginTop={1}>
      <StepDelayControl run={actions.orchestrator} />
      <SaveAction
        actions={actions}
        disabled={disabled}
        submitting={submitting}
        label={saveLabel ?? (saveButtonVariant === "next" ? "Next" : "Save changes")}
      />
      <CancelAction
        enabled={Boolean(showCancel)}
        submitting={submitting}
        label={cancelLabel ?? (cancelButtonVariant === "previous" ? "Previous" : "Cancel")}
        onCancel={cancelEditing}
      />
    </Box>
  );
};
