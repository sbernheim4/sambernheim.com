import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import { updateCacheWithMutationResponse } from "../src/forms/orchestration/orchestrator.ts";
import {
  profileCacheUpdates,
  operationsCacheUpdates,
} from "../src/features/workspace/childCachePolicies.ts";
import {
  organizationCacheUpdates,
  projectCacheUpdates,
  taskCacheUpdates,
} from "../src/features/workspace/cachePolicies.ts";
import { reconcileWorkspaceRead } from "../src/features/workspace/cache.ts";
import { clearWorkspace } from "../src/features/workspace/clearWorkspace.ts";
import { getSaveGuard } from "../src/forms/orchestration/orchestrator.ts";
import { workspaceKeys as keys, bootstrapKey } from "../src/features/workspace/queries.ts";
import type { Organization } from "../src/features/workspace/types.ts";
const organization: Organization = {
  id: "org-1",
  name: "Old",
  sector: "healthcare",
  status: "active",
  region: "east",
  updatedAt: "1",
  profileUpdatedAt: "1",
  operationsUpdatedAt: "1",
};
const client = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: false,
        structuralSharing: reconcileWorkspaceRead,
      },
    },
  });

test("two children merge owned fields into every summary and later stale navigation reads retain both", async () => {
  const qc = client();
  const context = { queryClient: qc, results: {} };
  updateCacheWithMutationResponse(
    {
      ...context,
      response: { organization, readModelLagMs: 2500 },
      variables: undefined,
    },
    organizationCacheUpdates(),
  );
  const profile = {
    organizationId: "org-1",
    name: "New",
    sector: "education" as const,
    updatedAt: "2",
  };
  const operations = {
    organizationId: "org-1",
    status: "paused" as const,
    region: "west" as const,
    updatedAt: "3",
  };
  assert.deepEqual(
    updateCacheWithMutationResponse(
      {
        ...context,
        response: { profile, readModelLagMs: 2500 },
        variables: profile,
      },
      profileCacheUpdates(organization),
    ),
    [],
  );
  assert.deepEqual(
    updateCacheWithMutationResponse(
      {
        ...context,
        response: { operations, readModelLagMs: 2500 },
        variables: operations,
      },
      operationsCacheUpdates(organization),
    ),
    [],
  );
  for (const key of [keys.organizations.detail("org-1"), keys.organizations.list(), bootstrapKey]) {
    const data: any = qc.getQueryData(key);
    const summary = Array.isArray(data)
      ? data[0]
      : data.organizations
        ? data.organizations[0]
        : data;
    assert.equal(summary.name, "New");
    assert.equal(summary.region, "west");
  }
  await qc.fetchQuery({
    queryKey: keys.organizations.detail("org-1"),
    queryFn: async () => organization,
  });
  await qc.fetchQuery({
    queryKey: keys.organizations.list(),
    queryFn: async () => [],
  });
  const summary = qc.getQueryData<Organization>(keys.organizations.detail("org-1"))!;
  assert.equal(summary.name, "New");
  assert.equal(summary.status, "paused");
  assert.equal(qc.getQueryData<Organization[]>(keys.organizations.list())!.length, 1);
  assert.equal(qc.getQueryData<any>(keys.organizationProfiles.detail("org-1")).name, "New");
  assert.equal(qc.getQueryData<any>(keys.organizationOperations.detail("org-1")).region, "west");
});

test("partial profile save preserves operations and newer operations timestamp cannot hide stale profile fields", () => {
  const previous = {
    ...organization,
    name: "Saved profile",
    profileUpdatedAt: "2",
    updatedAt: "2",
  };
  const incoming = {
    ...organization,
    region: "west" as const,
    operationsUpdatedAt: "3",
    updatedAt: "3",
  };
  const merged = reconcileWorkspaceRead(previous, incoming) as Organization;
  assert.equal(merged.name, "Saved profile");
  assert.equal(merged.region, "west");
});

test("project/task saves populate parent lists, detail caches, and bootstrap", () => {
  const qc = client();
  const context = { queryClient: qc, results: {}, variables: undefined };
  const project = {
    id: "p",
    organizationId: "org-1",
    name: "P",
    priority: "high" as const,
    phase: "planning" as const,
    budget: "$50k",
    updatedAt: "1",
  };
  const task = {
    id: "t",
    organizationId: "org-1",
    projectId: "p",
    title: "T",
    owner: "alex" as const,
    status: "todo" as const,
    dueWindow: "this-week" as const,
    updatedAt: "1",
  };
  updateCacheWithMutationResponse(
    { ...context, response: { project, readModelLagMs: 2500 } },
    projectCacheUpdates(),
  );
  updateCacheWithMutationResponse(
    { ...context, response: { task, readModelLagMs: 2500 } },
    taskCacheUpdates(),
  );
  assert.deepEqual(qc.getQueryData(keys.projects.forOrganization("org-1")), [project]);
  assert.deepEqual(qc.getQueryData(keys.tasks.forProject("p")), [task]);
  assert.deepEqual(qc.getQueryData(keys.projects.detail("p")), project);
  assert.deepEqual(qc.getQueryData(keys.tasks.detail("t")), task);
});

test("clear-all waits for lifecycle exclusion, removes resource caches, and blocks new saves during clear", async () => {
  const qc = client();
  qc.setQueryData(keys.organizationProfiles.detail("org-1"), { name: "saved" });
  const release = getSaveGuard(qc).begin();
  let calls = 0;
  const request = async () => {
    calls++;
    assert.throws(() => getSaveGuard(qc).begin(), /cleared/);
    return { organizations: [], projects: [], tasks: [] };
  };
  assert.equal(await clearWorkspace(qc, request), false);
  release();
  assert.equal(await clearWorkspace(qc, request), true);
  assert.equal(calls, 1);
  assert.equal(qc.getQueryData(keys.organizationProfiles.detail("org-1")), undefined);
  assert.deepEqual(qc.getQueryData(keys.organizations.list()), []);
});

import { QueryObserver } from "@tanstack/react-query";
import { readReplicaResource } from "../src/features/workspace/replicaRead.ts";
import { ApiError } from "../src/features/workspace/api.ts";

test("clear resets mounted list/detail observers, including version-aware query caches", async () => {
  const qc = client();
  let cleared = false;
  const list = new QueryObserver(qc, {
    queryKey: keys.organizations.list(),
    queryFn: async () => (cleared ? [] : [organization]),
  });
  const detail = new QueryObserver(qc, {
    queryKey: keys.organizations.detail("org-1"),
    queryFn: () =>
      readReplicaResource(qc, keys.organizations.detail("org-1"), async () => {
        if (cleared) throw new ApiError(404, "missing");
        return organization;
      }),
  });
  const unsubscribeList = list.subscribe(() => {});
  const unsubscribeDetail = detail.subscribe(() => {});
  await Promise.all([list.refetch(), detail.refetch()]);
  await clearWorkspace(qc, async () => {
    cleared = true;
    return { organizations: [], projects: [], tasks: [] };
  });
  assert.deepEqual(list.getCurrentResult().data, []);
  assert.equal(detail.getCurrentResult().data, undefined);
  assert.equal(detail.getCurrentResult().isError, true);
  unsubscribeList();
  unsubscribeDetail();
  qc.clear();
});

test("new resource navigation tolerates replica 404 only while an acknowledged cache value exists", async () => {
  const qc = client();
  const key = keys.organizations.detail("new");
  const missing = async (): Promise<Organization> => {
    throw new ApiError(404, "replica has not caught up");
  };
  await assert.rejects(readReplicaResource(qc, key, missing), /caught up/);
  qc.setQueryData(key, organization);
  assert.deepEqual(await readReplicaResource(qc, key, missing), organization);
  await assert.rejects(
    readReplicaResource(qc, key, async () => {
      throw new ApiError(503, "unavailable");
    }),
    /unavailable/,
  );
  qc.removeQueries({ queryKey: key });
  await assert.rejects(readReplicaResource(qc, key, missing), /caught up/);
});
