import { test } from "node:test";
import assert from "node:assert/strict";
import { apiHarness } from "./workspaceApiHarness";

test("child reads immediately reflect writes with independent field ownership and server composition", async () => {
  const api = apiHarness();
  const initial = await api.request("GET", "/api/organizations/org-1/profile");
  assert.equal(initial.data.name, "Existing Clinic");
  const operations = (await api.request("GET", "/api/organizations/org-1/operations")).data;
  const profile = (
    await api.request("PATCH", "/api/organizations/org-1/profile", {
      name: " Renamed ",
      sector: "finance",
      status: "paused",
    })
  ).data.profile;
  assert.equal(profile.name, "Renamed");
  assert.equal(profile.status, undefined);
  assert.equal((await api.request("GET", "/api/organizations/org-1/profile")).data.name, "Renamed");
  const summary = (await api.request("GET", "/api/organizations/org-1")).data;
  assert.equal(summary.name, "Renamed");
  assert.equal(summary.status, operations.status);
  assert.equal(summary.operationsUpdatedAt, operations.updatedAt);
  const savedOperations = (
    await api.request("PATCH", "/api/organizations/org-1/operations", {
      status: "paused",
      region: "west",
      name: "wrong owner",
    })
  ).data.operations;
  assert.equal(savedOperations.name, undefined);
  const legacy = (
    await api.request("PATCH", "/api/organizations/org-1", {
      name: "Legacy",
      sector: "education",
      status: "active",
      region: "central",
    })
  ).data.organization;
  assert.equal(legacy.name, "Legacy");
  assert.equal((await api.request("POST", "/api/organizations", { name: "New Org" })).status, 400);
  const created = (
    await api.request("POST", "/api/organizations", {
      name: "New Org",
      sector: "finance",
      status: "paused",
      region: "west",
    })
  ).data.organization;
  assert.equal(
    (await api.request("GET", `/api/organizations/${created.id}/profile`)).data.name,
    "New Org",
  );
  assert.equal(
    (await api.request("GET", `/api/organizations/${created.id}/operations`)).data.status,
    "paused",
  );
  assert.equal((await api.request("GET", "/api/organizations/org-1/profile")).data.name, "Legacy");
  assert.equal(
    (await api.request("GET", "/api/organizations/org-1/operations")).data.region,
    "central",
  );
  assert.equal(
    (await api.request("GET", "/api/organizations/org-1/projects")).data[0].id,
    "project-1",
  );
  assert.equal((await api.request("GET", "/api/projects/project-1/tasks")).data[0].id, "task-1");
});

test("missing parents fail and clear removes all resources", async () => {
  const api = apiHarness();
  for (const child of ["profile", "operations"]) {
    assert.equal((await api.request("GET", `/api/organizations/missing/${child}`)).status, 404);
    assert.equal(
      (await api.request("PATCH", `/api/organizations/missing/${child}`, {})).status,
      404,
    );
  }
  await api.request("PATCH", "/api/organizations/org-1/profile", {
    name: "Pending",
  });
  assert.deepEqual((await api.request("DELETE", "/api/entities")).data, {
    organizations: [],
    projects: [],
    tasks: [],
  });
  assert.equal((await api.request("GET", "/api/organizations/org-1/profile")).status, 404);
  assert.equal((await api.request("GET", "/api/organizations/org-1/operations")).status, 404);
  assert.deepEqual((await api.request("GET", "/api/bootstrap")).data, {
    organizations: [],
    projects: [],
    tasks: [],
  });
});

test("created and edited projects and tasks are immediately readable in detail, complete lists, parent lists and bootstrap", async () => {
  const api = apiHarness();
  const project = (
    await api.request("POST", "/api/projects", {
      organizationId: "org-1",
      name: "New project",
      priority: "high",
      phase: "planning",
      budget: "$50k",
    })
  ).data.project;
  const task = (
    await api.request("POST", "/api/tasks", {
      organizationId: "org-1",
      projectId: project.id,
      title: "New task",
      owner: "alex",
      status: "todo",
      dueWindow: "this-week",
    })
  ).data.task;
  for (const [collection, resource, parent, edits] of [
    ["projects", project, "/api/organizations/org-1/projects", { name: "Edited project" }],
    ["tasks", task, `/api/projects/${project.id}/tasks`, { title: "Edited task" }],
  ] as const) {
    assert.deepEqual(
      (await api.request("GET", `/api/${collection}/${resource.id}`)).data,
      resource,
    );
    const saved = (await api.request("PATCH", `/api/${collection}/${resource.id}`, edits)).data[
      collection === "projects" ? "project" : "task"
    ];
    assert.deepEqual((await api.request("GET", `/api/${collection}/${resource.id}`)).data, saved);
    for (const path of [`/api/${collection}`, parent]) {
      assert.deepEqual(
        (await api.request("GET", path)).data.find((item: { id: string }) => {
          return item.id === resource.id;
        }),
        saved,
      );
    }
    assert.deepEqual(
      (await api.request("GET", "/api/bootstrap")).data[collection].find((item: { id: string }) => {
        return item.id === resource.id;
      }),
      saved,
    );
  }
});
