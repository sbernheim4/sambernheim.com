import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import { test } from "vitest";

import { createOrchestrator } from "../src/forms/orchestration/orchestrator";
import { executeGraph } from "../src/forms/orchestration/scheduler";
import type { AnyForm } from "../src/forms/orchestration/types";

const form = (id: string, overrides: Partial<AnyForm> = {}): AnyForm => {
  return {
    id,
    snapshot: () => {
      return { id };
    },
    undoSnapshot: undefined,
    validate: () => {
      return { valid: true };
    },
    endpoint: {
      mutationFn: async () => {
        return { id };
      },
    },
    form: { reset: () => {} },
    ...overrides,
  };
};

test("reuses one mapped payload across retry attempts", async () => {
  let mapCalls = 0;
  let attempts = 0;
  const variables: unknown[] = [];
  const retryable = form("retryable", {
    retry: { maxRetries: 1, delayMs: 0 },
    toMutationPayload: () => {
      mapCalls += 1;
      return { stable: true };
    },
    endpoint: {
      retrySafe: true,
      mutationFn: async (input) => {
        attempts += 1;
        variables.push(input);
        if (attempts === 1) {
          throw Object.assign(new Error("temporary"), { status: 503 });
        }
        return { ok: true };
      },
    },
  });

  const result = await createOrchestrator(new QueryClient()).submit({ forms: [retryable] });

  assert.equal(result.outcome, "success");
  assert.equal(mapCalls, 1);
  assert.deepEqual(variables, [{ stable: true }, { stable: true }]);
});

test("timestamps every emitted progress snapshot", async () => {
  const snapshots: { correlationId: string; timestamp: number; phase: string }[] = [];
  const save = createOrchestrator(new QueryClient(), (state) => {
    snapshots.push({
      correlationId: state.correlationId,
      timestamp: state.timestamp,
      phase: state.phase,
    });
  });

  await save.submit({ forms: [form("timestamped")] });

  assert.ok(snapshots.length > 0);
  assert.equal(
    new Set(
      snapshots.map((snapshot) => {
        return snapshot.correlationId;
      }),
    ).size,
    1,
  );
  assert.notEqual(snapshots[0].correlationId, "idle");
  assert.ok(
    snapshots.every(({ timestamp }) => {
      return Number.isFinite(timestamp);
    }),
  );
  assert.ok(
    snapshots.every((snapshot, index) => {
      return index === 0 || snapshot.timestamp >= snapshots[index - 1].timestamp;
    }),
  );
});

test("runs unrelated forms while skipping descendants of a failed mutation", async () => {
  const events: string[] = [];
  const parent = form("parent", {
    endpoint: {
      mutationFn: async () => {
        events.push("parent");
        throw new Error("parent failed");
      },
    },
  });
  const child = form("child", {
    dependencies: [{ id: "parent" }],
    endpoint: {
      mutationFn: async () => {
        events.push("child");
        return {};
      },
    },
  });
  const unrelated = form("unrelated", {
    endpoint: {
      mutationFn: async () => {
        events.push("unrelated");
        return {};
      },
    },
  });

  const result = await createOrchestrator(new QueryClient()).submit({
    forms: [child, unrelated, parent],
  });

  assert.equal(result.outcome, "partial-failure");
  assert.deepEqual(events.sort(), ["parent", "unrelated"]);
  assert.equal(result.forms.child.status, "skipped");
  assert.deepEqual(result.forms.child.blockedBy, ["parent"]);
});

test("collects follow-up failures without changing a successful save outcome", async () => {
  const events: string[] = [];
  const failure = new Error("refresh failed");
  const saved = form("saved", {
    endpoint: {
      mutationFn: async () => {
        events.push("save");
        return { id: "saved" };
      },
    },
    refetchFunctions: [
      async () => {
        events.push("refresh");
        throw failure;
      },
    ],
    markSaved: () => {
      events.push("mark-saved");
      throw new Error("mark-saved failed");
    },
    onSuccess: () => {
      events.push("callback");
      throw new Error("callback failed");
    },
  });

  const result = await createOrchestrator(new QueryClient()).submit({ forms: [saved] });

  assert.equal(result.outcome, "saved-with-follow-up-errors");
  assert.deepEqual(events, ["save", "refresh", "mark-saved", "callback"]);
  assert.deepEqual(
    result.followUpErrors.map((entry) => {
      return entry.phase;
    }),
    ["refresh", "form-state", "effect"],
  );
});

test("does not retry a non-idempotent endpoint even with a retry policy", async () => {
  let attempts = 0;
  const create = form("create", {
    retry: { maxRetries: 3, delayMs: 0 },
    endpoint: {
      mutationFn: async () => {
        attempts += 1;
        throw Object.assign(new Error("temporarily unavailable"), { status: 503 });
      },
    },
  });

  const result = await createOrchestrator(new QueryClient()).submit({ forms: [create] });

  assert.equal(attempts, 1);
  assert.equal(result.forms.create.status, "failed");
});

test("normalizes scheduler concurrency and propagates blocked descendants", async () => {
  let active = 0;
  let maximum = 0;
  const result = await executeGraph(
    [
      {
        id: "root",
        prerequisites: [],
        run: async () => {
          active += 1;
          maximum = Math.max(maximum, active);
          await Promise.resolve();
          active -= 1;
          throw new Error("root failed");
        },
      },
      {
        id: "child",
        prerequisites: ["root"],
        run: async () => {
          return "child";
        },
      },
      {
        id: "independent",
        prerequisites: [],
        run: async () => {
          active += 1;
          maximum = Math.max(maximum, active);
          await Promise.resolve();
          active -= 1;
          return "independent";
        },
      },
    ],
    { concurrency: 0 },
  );

  assert.equal(maximum, 1);
  assert.equal(result.get("root")?.status, "failed");
  assert.deepEqual(result.get("child"), { status: "skipped", blockedBy: ["root"] });
  assert.deepEqual(result.get("independent"), { status: "completed", value: "independent" });
});
