import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { Box, Text } from "ink";
import { useFormEditorContext } from "../../../hooks/useFormEditorContext";

export const FormEditorOrchestratorProgress = () => {
  const { actions } = useFormEditorContext();
  const run = actions.orchestrator;
  if (!run?.isOpen) {
    return null;
  }
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>Form orchestration · {run.phase}</Text>
      <Text dimColor>Run {run.correlationId}</Text>
      {run.forms.map((form) => {
        const result = run.result?.forms[form.id];
        return (
          <Text key={form.id}>
            {result?.status === "saved" ? "✓" : result?.status === "failed" ? "!" : "○"} {form.id}:{" "}
            {result?.status ?? run.phase}
            {result?.failure ? ` · ${String(result.failure.error)}` : ""}
          </Text>
        );
      })}
      {run.result?.followUpErrors.map((error, index) => {
        return (
          <Text key={index} color="red">
            {error.formId ?? "Run"}: {String(error.error)}
          </Text>
        );
      })}
    </Box>
  );
};

export const FormEditorOrchestratorStatus = () => {
  const { actions } = useFormEditorContext();
  const run = actions.orchestrator;
  useTuiInput((input) => {
    if (run?.isOpen && run.phase === "complete" && input === "x") {
      void run.close();
    }
  });
  if (!run?.isOpen) {
    return null;
  }
  return (
    <Text color={run.phase === "complete" ? "green" : "yellow"}>
      {run.phase === "complete"
        ? "Form changes saved · x dismiss"
        : `Saving form changes… ${run.phase}`}
    </Text>
  );
};
