import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { defineForm } from "./formConfig";
import { createOrchestrator } from "../src/forms/orchestration/orchestrator.ts";
import { getSaveGuard } from "../src/forms/orchestration/orchestrator.ts";
const client = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
const valid = () => ({ valid: true as const });

test("snapshots all children, validates before writes, maps once and retries ordered saves", async () => {
  const log: string[] = [];
  const gate = deferred();
  const values = { name: "initial" };
  let tries = 0;
  let maps = 0;
  const a = defineForm({
    id: "a",
    snapshot: () => values,
    validate: async (snapshot) => {
      await gate.promise;
      assert.equal(snapshot.name, "initial");
      return valid();
    },
    toMutationPayload: (v) => {
      maps++;
      return v;
    },
    endpoint: {
      retrySafe: true,
      mutationFn: async (v: { name: string }) => {
        log.push(`a:${v.name}`);
        if (++tries === 1) throw { status: 503 };
        return { id: v.name };
      },
    },
  });
  const b = defineForm({
    id: "b",
    dependencies: [a],
    snapshot: () => values,
    validate: valid,
    toMutationPayload: (v, { results }) => ({
      name: `${results.a!.id}:${v.name}`,
    }),
    endpoint: {
      mutationFn: async (v: { name: string }) => {
        log.push(`b:${v.name}`);
        return v;
      },
    },
  });
  const executor = createOrchestrator<readonly [typeof a, typeof b]>(client());
  const pending = executor.submit({ forms: [a, b], retry: { delayMs: 0 } });
  values.name = "edited";
  assert.deepEqual(log, []);
  assert.equal(executor.submit({ forms: [a, b] }), pending);
  assert.equal(executor.reset(), false);
  gate.resolve();
  const result = await pending;
  assert.equal(result.outcome, "success");
  assert.equal(maps, 1);
  assert.deepEqual(log, ["a:initial", "a:initial", "b:initial:initial"]);
  assert.equal(result.forms.a.attempts, 2);
});

test("validation and independent mapping failures issue no writes or refreshes, callbacks once", async () => {
  for (const phase of ["validation", "mapping"] as const) {
    const log: string[] = [];
    const a = defineForm({
      id: "a",
      snapshot: () => 1,
      validate: valid,
      endpoint: {
        mutationFn: async (v: number) => {
          log.push("write");
          return v;
        },
      },
      onSuccess: () => {
        log.push("a success");
      },
    });
    const b = defineForm({
      id: "b",
      snapshot: () => 1,
      validate: () => (phase === "validation" ? { valid: false, error: "invalid" } : valid()),
      toMutationPayload: () => {
        throw new Error("mapping");
      },
      endpoint: { mutationFn: async (v: number) => v },
      onFailure: (ctx) => {
        assert.equal(ctx.phase, phase);
        log.push("b failure");
      },
    });
    const result = await createOrchestrator<readonly [typeof a, typeof b]>(client()).submit({
      forms: [a, b],
      refetchFunctions: [
        () => {
          log.push("refresh");
        },
      ],
      onFailure: () => {
        log.push("group failure");
      },
    });
    assert.equal(result.outcome, "validation-failed");
    assert.deepEqual(log, ["b failure", "group failure"]);
    assert.equal(result.forms.a.status, "skipped");
  }
});

test("partial failure retains persistence, waits for every refresh, reconciles then runs child/group outcomes", async () => {
  const qc = client();
  const gate = deferred();
  const log: string[] = [];
  let tries = 0;
  qc.setQueryData(["summary"], { old: true });
  const a = defineForm({
    id: "a",
    snapshot: () => "submitted",
    validate: valid,
    endpoint: {
      mutationFn: async (v: string) => {
        log.push("write a");
        return { name: v };
      },
      refetchFunctions: [
        () => {
          throw Error("refresh");
        },
        async () => {
          await gate.promise;
          qc.setQueryData(["summary"], "stale");
          log.push("refetched");
        },
      ],
      cacheUpdates: [
        {
          queryKey: () => {
            throw Error("key");
          },
        },
        { queryKey: () => ["summary"], getData: (r) => r.name },
      ],
    },
    markSaved: () => {
      log.push("form-state");
    },
    onSuccess: ({ followUpErrors }) => {
      assert.equal(qc.getQueryData(["summary"]), "submitted");
      assert.equal(followUpErrors.length, 2);
      log.push("a success");
      throw Error("effect");
    },
  });
  const b = defineForm({
    id: "b",
    snapshot: () => 2,
    validate: valid,
    endpoint: {
      retrySafe: true,
      mutationFn: async (_v: number) => {
        tries++;
        throw { status: 503 };
      },
    },
    onFailure: () => {
      log.push("b failure");
    },
  });
  const c = defineForm({
    id: "c",
    snapshot: () => 3,
    validate: valid,
    endpoint: {
      mutationFn: async (v: number) => {
        log.push("write c");
        return v;
      },
    },
    onFailure: () => {
      log.push("c failure");
    },
  });
  const pending = createOrchestrator<readonly [typeof a, typeof b, typeof c]>(qc).submit({
    forms: [a, b, c],
    retry: { delayMs: 0 },
    onFailure: ({ result }) => {
      assert.equal(result.responses.a?.name, "submitted");
      log.push("group failure");
    },
  });
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(getSaveGuard(qc).getSnapshot(), 1);
  assert.equal(getSaveGuard(qc).beginClear(), undefined);
  assert.deepEqual(log, ["write a"]);
  gate.resolve();
  const result = await pending;
  assert.equal(tries, 2);
  assert.equal(result.outcome, "partial-failure");
  assert.equal(result.forms.c.status, "skipped");
  assert.equal(result.followUpErrors.length, 3);
  assert.deepEqual(log, [
    "write a",
    "refetched",
    "form-state",
    "a success",
    "b failure",
    "group failure",
  ]);
  assert.equal(getSaveGuard(qc).getSnapshot(), 0);
});

test("invalidation and direct refetch settle before injection; successful writes never retry for follow-up failures", async () => {
  const qc = client();
  const gate = deferred();
  let saving = false;
  let writes = 0;
  const observer = new QueryObserver(qc, {
    queryKey: ["resource"],
    queryFn: async () => {
      if (saving) await gate.promise;
      return "stale";
    },
  });
  const unsub = observer.subscribe(() => {});
  await observer.refetch();
  saving = true;
  const p = defineForm({
    id: "p",
    snapshot: () => 1,
    validate: valid,
    endpoint: {
      retrySafe: true,
      mutationFn: async (v: number) => {
        writes++;
        return v;
      },
      invalidateQueryKeys: [["resource"]],
      refetchFunctions: [
        observer.refetch.bind(observer),
        () => {
          throw Error("sync");
        },
      ],
      cacheUpdates: [{ queryKey: () => ["resource"] }],
    },
    onSuccess: async () => {
      throw Error("toast");
    },
    onFailure: () => {
      assert.fail("success must not trigger failure");
    },
  });
  const pending = createOrchestrator<readonly [typeof p]>(qc).submit({
    forms: [p],
    onSuccess: () => {
      throw Error("group toast");
    },
  });
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(qc.getQueryData(["resource"]), "stale");
  gate.resolve();
  const result = await pending;
  assert.equal(qc.getQueryData(["resource"]), 1);
  assert.equal(writes, 1);
  assert.equal(result.outcome, "saved-with-follow-up-errors");
  assert.equal(result.followUpErrors.length, 3);
  unsub();
});

test("duplicate IDs, reversed dependencies and clear lock reject before writes", async () => {
  const qc = client();
  const p = defineForm({
    id: "p",
    snapshot: () => 1,
    validate: valid,
    endpoint: { mutationFn: async (_v: number) => assert.fail("no writes") },
  });
  await assert.rejects(createOrchestrator(qc).submit({ forms: [p, p] }), /Duplicate/);
  const dependent = defineForm({
    id: "q",
    dependencies: [p],
    snapshot: () => 1,
    validate: valid,
    endpoint: { mutationFn: async (_v: number) => 1 },
  });
  await assert.rejects(createOrchestrator(qc).submit({ forms: [dependent, p] }), /precede/);
  const release = getSaveGuard(qc).beginClear()!;
  await assert.rejects(createOrchestrator(qc).submit({ forms: [p] }), /cleared/);
  release();
});

test("permanent errors and non-idempotent creates never automatically retry", async () => {
  for (const [retrySafe, status] of [
    [true, 400],
    [false, 503],
  ] as const) {
    let writes = 0;
    const p = defineForm({
      id: "p",
      snapshot: () => 1,
      validate: valid,
      endpoint: {
        retrySafe,
        mutationFn: async (_v: number) => {
          writes++;
          throw { status };
        },
      },
    });
    const result = await createOrchestrator<readonly [typeof p]>(client()).submit({
      forms: [p],
      retry: { delayMs: 0 },
    });
    assert.equal(writes, 1);
    assert.equal(result.forms.p.failure?.phase, "save");
  }
});

test("active runs retain callback definitions; group cache targets follow children and undefined selectors do not delete", async () => {
  const qc = client();
  const wait = deferred();
  const log: string[] = [];
  qc.setQueryData(["keep"], 1);
  const first = defineForm({
    id: "first",
    snapshot: () => 5,
    validate: valid,
    endpoint: {
      mutationFn: async (v: number) => {
        await wait.promise;
        return { value: v };
      },
      cacheUpdates: [
        {
          queryKey: ({ variables }) => ["child", variables],
          getData: (response) => {
            log.push("child cache");
            return response.value;
          },
        },
        { queryKey: () => ["keep"], getData: () => undefined },
      ],
    },
    onSuccess: async () => {
      await Promise.resolve();
      log.push("child callback");
    },
  });
  const config = {
    forms: [first] as const,
    refetchFunctions: [
      () => {
        log.push("group refresh");
      },
    ],
    cacheUpdates: [
      {
        queryKey: () => ["group"],
        getData: (response: { first?: { value: number } }) => {
          log.push("group cache");
          return response.first?.value;
        },
      },
    ],
    onSuccess: async () => {
      log.push("original group callback");
    },
  };
  const runner = createOrchestrator<readonly [typeof first]>(qc);
  const pending = runner.submit(config);
  config.onSuccess = async () => {
    log.push("replacement callback");
  };
  config.refetchFunctions.length = 0;
  first.onSuccess = () => {
    log.push("replacement child callback");
  };
  first.endpoint.cacheUpdates = [];
  wait.resolve();
  const result = await pending;
  assert.equal(result.outcome, "success");
  assert.equal(qc.getQueryData(["keep"]), 1);
  assert.deepEqual(log, [
    "group refresh",
    "child cache",
    "group cache",
    "child callback",
    "original group callback",
  ]);
});

test("dependency mapping errors skip their request, preserve successful parents and notify failure once", async () => {
  const log: string[] = [];
  const parent = defineForm({
    id: "parent",
    snapshot: () => 1,
    validate: valid,
    endpoint: { mutationFn: async (v: number) => v },
    onSuccess: () => {
      log.push("parent saved");
    },
  });
  const child = defineForm({
    id: "child",
    dependencies: [parent],
    snapshot: () => 1,
    validate: valid,
    toMutationPayload: (_values, { results }) => {
      assert.equal(results.parent, 1);
      throw new Error("invalid derived input");
    },
    endpoint: {
      mutationFn: async (_v: number) => assert.fail("no child request"),
    },
    onFailure: ({ phase, attempts }) => {
      assert.equal(phase, "mapping");
      assert.equal(attempts, 0);
      log.push("child failed");
    },
  });
  const result = await createOrchestrator<readonly [typeof parent, typeof child]>(client()).submit({
    forms: [parent, child],
  });
  assert.equal(result.outcome, "partial-failure");
  assert.equal(result.responses.parent, 1);
  assert.deepEqual(log, ["parent saved", "child failed"]);
});
