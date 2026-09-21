import assert from "node:assert/strict";
import { test } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import { createOrchestrator } from "../src/forms/orchestration/orchestrator";
import type { AnyForm, FormInput } from "../src/forms/orchestration/types";

const makeForm = ({
  id,
  dependencies = [],
  mutationFn,
  undoSnapshot = () => {return { id }},
  undoResponse = () => {return { id }},
}: {
  id: string;
  dependencies?: readonly FormInput[];
  mutationFn: (variables: unknown) => Promise<unknown>;
  undoSnapshot?: () => unknown;
  undoResponse?: () => unknown;
}): AnyForm => {
  return {
    id,
    dependencies,
    snapshot: () => {return { id }},
    undoSnapshot,
    undoResponse,
    validate: () => {return { valid: true }},
    endpoint: { mutationFn },
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

  await new Promise((resolve) => {return setImmediate(resolve)});
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
    validate: () => {return { valid: true }},
    endpoint: { mutationFn: async () => {return {}} },
    form: { reset: () => {} },
  };
  const b: AnyForm = {
    id: "b",
    dependencies: [a],
    snapshot: () => {
      snapshots += 1;
      return {};
    },
    validate: () => {return { valid: true }},
    endpoint: { mutationFn: async () => {return {}} },
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
