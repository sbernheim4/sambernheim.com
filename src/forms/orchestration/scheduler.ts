export type RunnableNode<T> = {
  id: string;
  prerequisites: readonly string[];
  run: () => Promise<T>;
};

export type NodeResult<T> =
  | { status: "completed"; value: T }
  | { status: "failed"; error: unknown }
  | { status: "skipped"; blockedBy: readonly string[] };

export type SchedulerEvent<T> =
  | { type: "started"; id: string }
  | { type: "completed"; id: string; value: T }
  | { type: "failed"; id: string; error: unknown }
  | { type: "skipped"; id: string; blockedBy: readonly string[] };

type SchedulerOptions<T> = {
  concurrency?: number;
  onNodeState?: (event: SchedulerEvent<T>) => void;
};

const normalizeConcurrency = (value: number | undefined) => {
  if (value === undefined || value === Infinity) {
    return Infinity;
  }
  if (Number.isNaN(value)) {
    return 1;
  }
  return Math.max(1, Math.floor(value));
};

export const executeGraph = async <T>(
  nodes: readonly RunnableNode<T>[],
  options: SchedulerOptions<T> = {},
): Promise<ReadonlyMap<string, NodeResult<T>>> => {
  const byId = new Map<string, RunnableNode<T>>();
  for (const node of nodes) {
    if (byId.has(node.id)) {
      throw new Error(`Duplicate runnable node ID: ${node.id}`);
    }
    byId.set(node.id, node);
  }
  for (const node of nodes) {
    for (const prerequisite of node.prerequisites) {
      if (!byId.has(prerequisite)) {
        throw new Error(`Missing prerequisite ${prerequisite} for ${node.id}.`);
      }
      if (prerequisite === node.id) {
        throw new Error(`Runnable node ${node.id} cannot depend on itself.`);
      }
    }
  }

  const results = new Map<string, NodeResult<T>>();
  const pending = new Set(
    nodes.map(({ id }) => {
      return id;
    }),
  );
  const active = new Set<string>();
  const running = new Set<Promise<void>>();
  const allTasks = new Set<Promise<void>>();
  const concurrency = normalizeConcurrency(options.concurrency);
  let firstEventError: unknown;
  let hasEventError = false;

  const emit = (event: SchedulerEvent<T>) => {
    try {
      options.onNodeState?.(event);
    } catch (error) {
      if (!hasEventError) {
        hasEventError = true;
        firstEventError = error;
      }
      throw error;
    }
  };

  try {
    while (pending.size || active.size) {
      let changed = false;

      for (const node of nodes) {
        if (!pending.has(node.id)) {
          continue;
        }
        const blockedBy = node.prerequisites.filter((id) => {
          const result = results.get(id);
          return result?.status === "failed" || result?.status === "skipped";
        });
        if (blockedBy.length) {
          pending.delete(node.id);
          results.set(node.id, { status: "skipped", blockedBy });
          emit({ type: "skipped", id: node.id, blockedBy });
          changed = true;
        }
      }

      const available = nodes.filter((node) => {
        return (
          pending.has(node.id) &&
          !active.has(node.id) &&
          node.prerequisites.every((id) => {
            return results.get(id)?.status === "completed";
          })
        );
      });
      const slots =
        concurrency === Infinity ? available.length : Math.max(0, concurrency - active.size);
      const toStart = available.slice(0, slots);

      for (const node of toStart) {
        pending.delete(node.id);
        active.add(node.id);
        emit({ type: "started", id: node.id });
        const task = node.run().then(
          (value) => {
            active.delete(node.id);
            results.set(node.id, { status: "completed", value });
            emit({ type: "completed", id: node.id, value });
          },
          (error: unknown) => {
            active.delete(node.id);
            results.set(node.id, { status: "failed", error });
            emit({ type: "failed", id: node.id, error });
          },
        );
        running.add(task);
        allTasks.add(task);
        void task.then(
          () => {
            running.delete(task);
          },
          () => {
            running.delete(task);
          },
        );
        changed = true;
      }

      if (active.size) {
        await Promise.race(running);
        continue;
      }

      if (pending.size && !changed) {
        throw new Error("Runnable graph cannot make progress; check for a dependency cycle.");
      }
    }
  } catch (error) {
    await Promise.allSettled(allTasks);
    throw hasEventError ? firstEventError : error;
  }

  return new Map(
    nodes.map(({ id }) => {
      return [id, results.get(id)!];
    }),
  );
};

export { normalizeConcurrency };
