import assert from "node:assert/strict";
import { test } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import { createOrchestrator } from "../src/forms/orchestration/orchestrator";
import type { AnyForm, FormInput } from "../src/forms/orchestration/types";

const makeForm = ({
  id,
  dependencies = [],
  mutationFn,
  undoSnapshot = () => {
    return { id };
  },
  undoResponse = () => {
    return { id };
  },
  snapshot = () => {
    return { id };
  },
  validate = () => {
    return { valid: true } as const;
  },
  toMutationPayload,
  retrySafe = false,
  retry,
  onSuccess,
  onFailure,
}: {
  id: string;
  dependencies?: readonly FormInput[];
  mutationFn: (variables: unknown) => Promise<unknown>;
  undoSnapshot?: () => unknown;
  undoResponse?: () => unknown;
  snapshot?: () => unknown;
  validate?: (
    values: unknown,
  ) =>
    | { valid: true }
    | { valid: false; error: unknown }
    | Promise<{ valid: true } | { valid: false; error: unknown }>;
  toMutationPayload?: (values: unknown, context: { results: Record<string, unknown> }) => unknown;
  retrySafe?: boolean;
  retry?: { maxRetries?: number; delayMs?: number; shouldRetry?: (error: unknown) => boolean };
  onSuccess?: (context: unknown) => void | Promise<void>;
  onFailure?: (context: unknown) => void | Promise<void>;
}): AnyForm => {
  return {
    id,
    dependencies,
    snapshot,
    undoSnapshot,
    undoResponse,
    validate,
    toMutationPayload,
    onSuccess,
    onFailure,
    retry,
    endpoint: { mutationFn, retrySafe },
    form: {
      reset: () => {},
    },
  };
};

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
};

test("executes independent forms in parallel and waits for graph dependencies", async () => {
  const started: string[] = [];
  const aDeferred = deferred<{ id: string }>();
  const bDeferred = deferred<{ id: string }>();

  const a = makeForm({
    id: "a",
    mutationFn: async () => {
      started.push("a");
      return aDeferred.promise;
    },
  });
  const b = makeForm({
    id: "b",
    mutationFn: async () => {
      started.push("b");
      return bDeferred.promise;
    },
  });
  const c = makeForm({
    id: "c",
    dependencies: [a, b],
    mutationFn: async () => {
      started.push("c");
      return { id: "c" };
    },
  });
  const orchestrator = createOrchestrator(new QueryClient());
  const resultPromise = orchestrator.submit({ forms: [c, b, a] });

  await new Promise((resolve) => {
    return setImmediate(resolve);
  });
  assert.deepEqual(started, ["b", "a"]);

  aDeferred.resolve({ id: "a" });
  bDeferred.resolve({ id: "b" });

  const result = await resultPromise;

  assert.equal(result.outcome, "success");
  assert.deepEqual(started, ["b", "a", "c"]);
});

test("rejects cycles before snapshots or mutations", async () => {
  let snapshots = 0;
  const a: AnyForm = {
    id: "a",
    dependencies: [{ id: "b" }],
    snapshot: () => {
      snapshots += 1;
      return {};
    },
    validate: () => {
      return { valid: true };
    },
    endpoint: {
      mutationFn: async () => {
        return {};
      },
    },
    form: { reset: () => {} },
  };
  const b: AnyForm = {
    id: "b",
    dependencies: [a],
    snapshot: () => {
      snapshots += 1;
      return {};
    },
    validate: () => {
      return { valid: true };
    },
    endpoint: {
      mutationFn: async () => {
        return {};
      },
    },
    form: { reset: () => {} },
  };
  a.dependencies = [b];

  const orchestrator = createOrchestrator(new QueryClient());

  await assert.rejects(orchestrator.submit({ forms: [a, b] }), /Circular dependency detected/);
  assert.equal(snapshots, 0);
});

test("undoes successful forms in reverse dependency order after partial failure", async () => {
  let undoMode = false;
  const events: string[] = [];

  const a = makeForm({
    id: "a",
    mutationFn: async () => {
      events.push(undoMode ? "undo-a" : "save-a");
      return { id: "a" };
    },
  });
  const b = makeForm({
    id: "b",
    dependencies: [a],
    mutationFn: async () => {
      events.push(undoMode ? "undo-b" : "save-b");
      return { id: "b" };
    },
  });
  const c = makeForm({
    id: "c",
    dependencies: [b],
    mutationFn: async () => {
      events.push("save-c");
      throw new Error("c failed");
    },
  });
  const orchestrator = createOrchestrator(new QueryClient());
  const forward = await orchestrator.submit({ forms: [c, b, a] });

  assert.equal(forward.outcome, "partial-failure");
  assert.deepEqual(events, ["save-a", "save-b", "save-c"]);

  undoMode = true;
  const undo = await orchestrator.submit({
    forms: [a, b],
    undoFormValues: {
      a: forward.undoFormValues!.a,
      b: forward.undoFormValues!.b,
    },
    undoPayloads: {
      a: forward.undoPayloads!.a,
      b: forward.undoPayloads!.b,
    },
  });

  assert.equal(undo.outcome, "success");
  assert.deepEqual(events, ["save-a", "save-b", "save-c", "undo-b", "undo-a"]);
});

test("captures snapshots before asynchronous validation and uses captured values", async () => {
  let resolveValidation!: () => void;
  const validationStarted = new Promise<void>((resolve) => {
    resolveValidation = resolve;
  });
  let currentValue = "before";
  const seen: unknown[] = [];

  const form = makeForm({
    id: "form",
    snapshot: () => {
      return currentValue;
    },
    validate: async (value) => {
      await validationStarted;
      seen.push(value);
      return { valid: true };
    },
    mutationFn: async (variables) => {
      seen.push(variables);
      return { ok: true };
    },
  });

  const promise = createOrchestrator(new QueryClient()).submit({ forms: [form] });
  currentValue = "after";
  resolveValidation();

  const result = await promise;
  assert.deepEqual(seen, ["before", "before"]);
  assert.equal(result.outcome, "success");
});

test("validation failure prevents mutations and invokes failure callbacks", async () => {
  let mutations = 0;
  let failures = 0;
  const form = makeForm({
    id: "invalid",
    validate: () => {
      return { valid: false, error: new Error("bad values") };
    },
    mutationFn: async () => {
      mutations += 1;
      return {};
    },
    onFailure: async () => {
      failures += 1;
    },
  });

  const result = await createOrchestrator(new QueryClient()).submit({ forms: [form] });

  assert.equal(result.outcome, "validation-failed");
  assert.equal(result.forms.invalid.status, "invalid");
  assert.equal(mutations, 0);
  assert.equal(failures, 1);
});

test("retries transient errors only for retry-safe endpoints", async () => {
  let attempts = 0;
  const form = makeForm({
    id: "retryable",
    retrySafe: true,
    retry: { maxRetries: 1, delayMs: 0 },
    mutationFn: async () => {
      attempts += 1;
      if (attempts === 1) {
        throw Object.assign(new Error("temporary"), { status: 503 });
      }
      return { ok: true };
    },
  });

  const result = await createOrchestrator(new QueryClient()).submit({ forms: [form] });

  assert.equal(result.outcome, "success");
  assert.equal(result.forms.retryable.attempts, 2);
});

test("refreshes, reconciles caches, marks forms saved, and runs callbacks in order", async () => {
  const events: string[] = [];
  const queryClient = new QueryClient();
  const form = makeForm({
    id: "form",
    mutationFn: async () => {
      events.push("save");
      return { id: "saved" };
    },
    onSuccess: async () => {
      events.push("callback");
    },
  });
  form.markSaved = async () => {
    events.push("mark-saved");
  };
  form.refetchFunctions = [
    async () => {
      events.push("refresh");
    },
  ];
  form.cacheUpdates = [
    {
      queryKey: () => {
        return ["form", "saved"];
      },
      getData: (response) => {
        return response;
      },
    },
  ];

  const result = await createOrchestrator(queryClient).submit({ forms: [form] });

  assert.equal(result.outcome, "success");
  assert.deepEqual(events, ["save", "refresh", "mark-saved", "callback"]);
  assert.deepEqual(queryClient.getQueryData(["form", "saved"]), { id: "saved" });
});

test("emits the lifecycle phases and coalesces concurrent submissions", async () => {
  const phases: string[] = [];
  const deferredMutation = deferred<unknown>();
  const form = makeForm({
    id: "form",
    mutationFn: async () => {
      return deferredMutation.promise;
    },
  });
  const orchestrator = createOrchestrator(new QueryClient(), ({ phase }) => {
    phases.push(phase);
  });

  const first = orchestrator.submit({ forms: [form] });
  const second = orchestrator.submit({ forms: [form] });
  assert.equal(first, second);
  deferredMutation.resolve({ ok: true });

  await first;
  assert.deepEqual(phases, [
    "validating",
    "saving",
    "saving",
    "refreshing",
    "reconciling",
    "effects",
    "complete",
  ]);
});
