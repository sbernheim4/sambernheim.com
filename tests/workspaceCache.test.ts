import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { ApiError } from "../src/features/workspace/api";
import { clearWorkspace } from "../src/features/workspace/clearWorkspace";
import { bootstrapKey, bootstrapQueryOptions, workspaceKey } from "../src/features/workspace/queryOptions";
import { organizationKey, organizationProfileKey, organizationsKey, organizationQueryOptions, organizationProfileQueryOptions, organizationOperationsQueryOptions, organizationsQueryOptions } from "../src/features/workspace/organizations/queryOptions";
import { organizationProjectsKey, projectKey, projectsKey, projectListsKey, organizationProjectsQueryOptions, projectQueryOptions, projectsQueryOptions } from "../src/features/workspace/projects/queryOptions";
import { projectTasksKey, taskKey, tasksKey, taskListsKey, projectTasksQueryOptions, taskQueryOptions, tasksQueryOptions } from "../src/features/workspace/tasks/queryOptions";

const organization = { id: "org-1", name: "Old", sector: "healthcare", status: "active", region: "east", updatedAt: "1" } as const;
const client = () => { return new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } }); };

test("keys separate complete lists, parent lists, details and collection prefixes", () => {
  const keys = [workspaceKey(), bootstrapKey(), organizationsKey(), organizationKey("a"), organizationKey("b"), projectListsKey(), projectsKey(), organizationProjectsKey("a"), organizationProjectsKey("b"), projectKey("a"), projectKey("b"), taskListsKey(), tasksKey(), projectTasksKey("a"), projectTasksKey("b"), taskKey("a"), taskKey("b")];
  assert.equal(new Set(keys.map((key) => { return JSON.stringify(key); })).size, keys.length);
  const qc = client();
  for (const key of keys.filter((key) => { return ![workspaceKey(), projectListsKey(), taskListsKey()].some((prefix) => { return JSON.stringify(key) === JSON.stringify(prefix); }); })) { qc.setQueryData(key, []); }
  assert.equal(qc.getQueryCache().findAll({ queryKey: projectsKey() }).length, 1);
  assert.equal(qc.getQueryCache().findAll({ queryKey: projectListsKey() }).length, 3);
  assert.equal(qc.getQueryCache().findAll({ queryKey: tasksKey() }).length, 1);
  assert.equal(qc.getQueryCache().findAll({ queryKey: taskListsKey() }).length, 3);
  qc.clear();
});

test("shared options fetch the parameterized SDK endpoint through ensureQueryData and prefetchQuery", async () => {
  const qc = client();
  const original = globalThis.fetch;
  const paths: string[] = [];
  globalThis.fetch = async (url) => { paths.push(String(url)); return Response.json({ marker: String(url) }); };
  try {
    const options = [bootstrapQueryOptions(), organizationsQueryOptions(), organizationQueryOptions("a/b"), organizationProfileQueryOptions("a/b"), organizationOperationsQueryOptions("a/b"), projectsQueryOptions(), organizationProjectsQueryOptions("a/b"), projectQueryOptions("a/b"), tasksQueryOptions(), projectTasksQueryOptions("a/b"), taskQueryOptions("a/b")];
    const endpoints = ["/api/bootstrap", "/api/organizations", "/api/organizations/a%2Fb", "/api/organizations/a%2Fb/profile", "/api/organizations/a%2Fb/operations", "/api/projects", "/api/organizations/a%2Fb/projects", "/api/projects/a%2Fb", "/api/tasks", "/api/projects/a%2Fb/tasks", "/api/tasks/a%2Fb"];
    for (const [index, option] of options.entries()) {
      // Each factory retains its result type; this loop exercises their common runtime contract.
      const shared = { ...option, staleTime: Infinity } as Parameters<QueryClient["ensureQueryData"]>[0];
      await qc.ensureQueryData(shared);
      await qc.prefetchQuery(shared);
      assert.deepEqual(qc.getQueryData(option.queryKey), { marker: endpoints[index] });
    }
    assert.deepEqual(paths, endpoints);
  } finally { globalThis.fetch = original; qc.clear(); }
});

test("missing IDs disable queries and detail options retain client/server retry behavior", () => {
  for (const options of [organizationQueryOptions(""), organizationProfileQueryOptions(""), organizationOperationsQueryOptions(""), projectQueryOptions(""), taskQueryOptions("")]) {
    assert.equal(options.enabled, false);
    assert.equal(typeof options.retry, "function");
    if (typeof options.retry !== "function") { throw new Error("Expected retry predicate"); }
    assert.equal(options.retry(0, new ApiError(404, "missing")), false);
    assert.equal(options.retry(0, new ApiError(503, "unavailable")), true);
    assert.equal(options.retry(1, new ApiError(503, "unavailable")), false);
  }
  assert.equal(organizationProjectsQueryOptions("").enabled, false);
  assert.equal(projectTasksQueryOptions("").enabled, false);
});

test("a genuine detail 404 rejects even when an older cache value exists", async () => {
  const qc = client();
  const original = globalThis.fetch;
  globalThis.fetch = async () => { return new Response("missing", { status: 404 }); };
  qc.setQueryData(organizationKey("gone"), { id: "gone" });
  try {
    await assert.rejects(qc.fetchQuery(organizationQueryOptions("gone")), (error: unknown) => { return error instanceof ApiError && error.status === 404; });
    assert.equal(qc.getQueryState(organizationKey("gone"))?.status, "error");
  } finally { globalThis.fetch = original; qc.clear(); }
});

test("Clear All resets active observers, cancels old reads and removes inactive workspace data only", async () => {
  const qc = client();
  let cleared = false;
  let cancelled = false;
  qc.setQueryData(["unrelated"], "keep");
  qc.setQueryData(organizationProfileKey("org-1"), { name: "saved" });
  const pending = qc.fetchQuery({ queryKey: projectKey("pending"), queryFn: ({ signal }) => { return new Promise((_resolve, reject) => { signal.addEventListener("abort", () => { cancelled = true; reject(new Error("cancelled")); }); }); } }).catch(() => {});
  const list = new QueryObserver(qc, { ...organizationsQueryOptions(), queryFn: async () => { return cleared ? [] : [organization]; } });
  const detail = new QueryObserver(qc, { ...organizationQueryOptions("org-1"), queryFn: async () => { if (cleared) { throw new ApiError(404, "missing"); } return organization; } });
  const unsubscribeList = list.subscribe(() => {});
  const unsubscribeDetail = detail.subscribe(() => {});
  try {
    await Promise.all([list.refetch(), detail.refetch()]);
    let calls = 0;
    assert.equal(await clearWorkspace(qc, async () => { calls++; cleared = true; return { organizations: [], projects: [], tasks: [] }; }), true);
    await pending;
    assert.equal(calls, 1);
    assert.equal(cancelled, true);
    assert.deepEqual(list.getCurrentResult().data, []);
    assert.equal(detail.getCurrentResult().data, undefined);
    assert.equal(detail.getCurrentResult().isError, true);
    assert.equal(qc.getQueryData(organizationProfileKey("org-1")), undefined);
    assert.deepEqual(qc.getQueryData(projectsKey()), []);
    assert.deepEqual(qc.getQueryData(tasksKey()), []);
    assert.deepEqual(qc.getQueryData(bootstrapKey()), { organizations: [], projects: [], tasks: [] });
    assert.equal(qc.getQueryData(["unrelated"]), "keep");
  } finally { unsubscribeList(); unsubscribeDetail(); qc.clear(); }
});
