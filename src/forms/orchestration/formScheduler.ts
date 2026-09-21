import type { AnyForm, Phase, SaveConfig } from "./types";
import { getVariablesWithOverrides } from "./validation";
import { resolveRetryPolicy, saveFormWithRetry } from "./mutation";
import { reduceRuntimeState, type FormStates, type Responses, type RuntimeState } from "./state";
import type { SavePlan } from "./plan";
import { executeGraph, type RunnableNode } from "./scheduler";

class PayloadMappingError extends Error {
  readonly phase = "mapping" as const;

  constructor(readonly cause: unknown) {
    super("Payload mapping failed.");
  }
}

export const saveFormsInGraph = async <P extends readonly AnyForm[]>(
  plan: SavePlan,
  initialStates: FormStates,
  initialResponses: Responses,
  config: SaveConfig<P>,
  emit: (phase: Phase, states: FormStates, responses: Responses) => void,
) => {
  let runtime: RuntimeState = {
    forms: { ...initialStates },
    responses: { ...initialResponses },
    followUpErrors: [],
  };

  const pending = plan.order.filter((id) => {
    return runtime.forms[id]?.status === "ready";
  });
  const nodes: RunnableNode<FormStates[string]>[] = [];

  for (const id of pending) {
    const node = plan.nodes.get(id);
    if (!node) {
      throw new Error(`Missing plan node: ${id}`);
    }

    nodes.push({
      id,
      prerequisites: node.prerequisites.filter((prerequisite) => {
        return pending.includes(prerequisite);
      }),
      run: async () => {
        let variables: unknown;
        try {
          variables = getVariablesWithOverrides(
            node.form,
            runtime.forms[id],
            runtime.responses,
            config.undoPayloads,
          );
          runtime = reduceRuntimeState(runtime, { type: "form.ready", id, variables });
        } catch (error) {
          throw new PayloadMappingError(error);
        }

        const current = runtime.forms[id];
        const retry = resolveRetryPolicy(node.form, config.retry);
        return saveFormWithRetry(
          node.form,
          { ...current, variables },
          retry,
          (progress) => {
            runtime = reduceRuntimeState(
              runtime,
              progress.status === "retrying"
                ? { type: "form.retrying", id }
                : { type: "form.saving", id, attempt: progress.attempts },
            );
            emit("saving", runtime.forms, runtime.responses);
          },
          config.progressDelayMs ?? 0,
        );
      },
    });
  }

  await executeGraph(nodes, {
    concurrency: config.maxConcurrency,
    onNodeState: (event) => {
      if (event.type === "completed") {
        if (event.value.status === "saved") {
          runtime = reduceRuntimeState(runtime, {
            type: "form.saved",
            id: event.id,
            response: event.value.response,
          });
        } else {
          runtime = reduceRuntimeState(runtime, {
            type: "form.failed",
            id: event.id,
            phase: "save",
            error: event.value.failure?.error,
          });
        }
        emit("saving", runtime.forms, runtime.responses);
      } else if (event.type === "failed") {
        runtime = reduceRuntimeState(runtime, {
          type: "form.failed",
          id: event.id,
          phase: event.error instanceof PayloadMappingError ? "mapping" : "save",
          error: event.error instanceof PayloadMappingError ? event.error.cause : event.error,
        });
        emit("saving", runtime.forms, runtime.responses);
      } else if (event.type === "skipped") {
        runtime = reduceRuntimeState(runtime, {
          type: "form.skipped",
          id: event.id,
          blockedBy: event.blockedBy,
        });
      }
    },
  });

  return { states: runtime.forms, responses: runtime.responses };
};
