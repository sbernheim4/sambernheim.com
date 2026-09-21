import type { AnyForm, Phase, SaveConfig } from "./types";
import { getVariablesWithOverrides } from "./validation";
import { resolveRetryPolicy, saveFormWithRetry } from "./mutation";
import { reduceRuntimeState, type FormStates, type Responses, type RuntimeState } from "./state";
import type { SavePlan } from "./plan";

export type RunnableNode<T> = {
  id: string;
  dependencies: readonly string[];
  run: () => Promise<T>;
};

export type SchedulerEvent<T> =
  | { type: "started"; id: string }
  | { type: "completed"; id: string; value: T }
  | { type: "failed"; id: string; error: unknown };

export const executeGraph = async <T>(
  nodes: readonly RunnableNode<T>[],
  options: {
    concurrency: number;
    onNodeState?: (event: SchedulerEvent<T>) => void;
  },
): Promise<ReadonlyMap<string, T | { error: unknown }>> => {
  const results = new Map<string, T | { error: unknown }>();
  let nextIndex = 0;
  const count = Math.min(
    nodes.length,
    Number.isFinite(options.concurrency) ? options.concurrency : nodes.length,
  );

  const worker = async () => {
    while (true) {
      const node = nodes[nextIndex++];
      if (!node) {
        return;
      }
      options.onNodeState?.({ type: "started", id: node.id });
      try {
        const value = await node.run();
        results.set(node.id, value);
        options.onNodeState?.({ type: "completed", id: node.id, value });
      } catch (error) {
        results.set(node.id, { error });
        options.onNodeState?.({ type: "failed", id: node.id, error });
      }
    }
  };

  await Promise.all(Array.from({ length: count }, worker));
  return results;
};

export const normalizeConcurrency = (value: number | undefined) => {
  return value === undefined || value === Infinity ? Infinity : Math.max(1, Math.floor(value));
};

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
  const undo = config.undoPayloads !== undefined;
  const prerequisites = (
    node: SavePlan["nodes"] extends ReadonlyMap<string, infer N> ? N : never,
  ) => {
    return undo ? node.dependents : node.dependencies;
  };

  while (true) {
    const pending = plan.order
      .map((id) => {
        return plan.nodes.get(id)!;
      })
      .filter((node) => {
        return runtime.forms[node.id].status === "ready";
      });
    if (!pending.length) {
      break;
    }

    const blocked = pending.filter((node) => {
      return prerequisites(node).some((id) => {
        return ["failed", "skipped"].includes(runtime.forms[id]?.status ?? "");
      });
    });
    for (const node of blocked) {
      runtime = reduceRuntimeState(runtime, {
        type: "form.skipped",
        id: node.id,
        blockedBy: prerequisites(node).filter((id) => {
          return ["failed", "skipped"].includes(runtime.forms[id]?.status ?? "");
        }),
      });
    }

    const ready = pending.filter((node) => {
      return (
        !blocked.includes(node) &&
        prerequisites(node).every((id) => {
          return runtime.forms[id]?.status === "saved";
        })
      );
    });
    if (!ready.length) {
      for (const node of pending) {
        runtime = reduceRuntimeState(runtime, {
          type: "form.skipped",
          id: node.id,
          blockedBy: prerequisites(node),
        });
      }
      break;
    }

    const executable: RunnableNode<FormStates[string]>[] = [];
    for (const node of ready) {
      const state = runtime.forms[node.id];
      try {
        const variables = getVariablesWithOverrides(
          node.form,
          state,
          runtime.responses,
          config.undoPayloads,
        );
        runtime = reduceRuntimeState(runtime, { type: "form.ready", id: node.id, variables });
        executable.push({
          id: node.id,
          dependencies: prerequisites(node),
          run: async () => {
            let finalState = runtime.forms[node.id];
            const retry = resolveRetryPolicy(node.form, config.retry);
            try {
              finalState = await saveFormWithRetry(
                node.form,
                { ...finalState, variables },
                retry,
                (progress) => {
                  runtime = reduceRuntimeState(runtime, {
                    type: progress.status === "retrying" ? "form.retrying" : "form.saving",
                    id: node.id,
                    ...(progress.status === "retrying" ? {} : { attempt: progress.attempts }),
                  } as any);
                  emit("saving", runtime.forms, runtime.responses);
                },
                config.progressDelayMs ?? 0,
              );
            } catch (error) {
              runtime = reduceRuntimeState(runtime, {
                type: "form.failed",
                id: node.id,
                phase: "save",
                error,
              });
              return runtime.forms[node.id];
            }
            if (finalState.status === "saved") {
              runtime = reduceRuntimeState(runtime, {
                type: "form.saved",
                id: node.id,
                response: finalState.response,
              });
            } else {
              runtime = reduceRuntimeState(runtime, {
                type: "form.failed",
                id: node.id,
                phase: "save",
                error: finalState.failure?.error,
              });
            }
            emit("saving", runtime.forms, runtime.responses);
            return runtime.forms[node.id];
          },
        });
      } catch (error) {
        runtime = reduceRuntimeState(runtime, {
          type: "form.failed",
          id: node.id,
          phase: "mapping",
          error,
        });
      }
    }

    await executeGraph(executable, {
      concurrency: normalizeConcurrency(config.maxConcurrency),
    });
  }

  return { states: runtime.forms, responses: runtime.responses };
};
