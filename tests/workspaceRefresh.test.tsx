import { test } from "node:test";
import assert from "node:assert/strict";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider, QueryObserver, type QueryKey } from "@tanstack/react-query";
import { apiHarness } from "./workspaceApiHarness";
import { bootstrapKey, bootstrapQueryOptions } from "../src/features/workspace/queryOptions";
import * as organizations from "../src/features/workspace/organizations/queryOptions";
import * as projects from "../src/features/workspace/projects/queryOptions";
import * as tasks from "../src/features/workspace/tasks/queryOptions";
import { useOrganizationForm } from "../src/features/workspace/organizations/hooks/useOrganizationForm";
import { useOrganizationProfileForm, useOrganizationOperationsForm } from "../src/features/workspace/organizations/hooks/organizationConfigurationForms";
import { useProjectForm } from "../src/features/workspace/projects/hooks/useProjectForm";
import { useTaskForm } from "../src/features/workspace/tasks/hooks/useTaskForm";
import { useWorkspaceLaunchForms } from "../src/features/workspace/hooks/useWorkspaceLaunchForms";
import type { Organization, Project, Task } from "../src/features/workspace/types";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const gate = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
};
const options = () => {
  return [
    bootstrapQueryOptions(), organizations.organizationsQueryOptions(),
    organizations.organizationQueryOptions("org-1"), organizations.organizationProfileQueryOptions("org-1"), organizations.organizationOperationsQueryOptions("org-1"),
    projects.projectsQueryOptions(), projects.organizationProjectsQueryOptions("org-1"), projects.organizationProjectsQueryOptions("other"), projects.projectQueryOptions("project-1"),
    tasks.tasksQueryOptions(), tasks.projectTasksQueryOptions("project-1"), tasks.projectTasksQueryOptions("other"), tasks.taskQueryOptions("task-1"),
  ];
};
const sameKey = (left: QueryKey, right: QueryKey) => { return JSON.stringify(left) === JSON.stringify(right); };

for (const active of [true, false]) {
  for (const kind of ["organization", "profile", "operations", "project", "task", "new organization", "new project", "new task", "launch", "partial launch"] as const) {
    test(`${kind} saves refresh only affected ${active ? "active" : "inactive"} queries and await active reads`, async () => {
      const api = apiHarness();
      const qc = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false, staleTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
      const original = globalThis.fetch;
      const refresh = gate();
      const started = gate();
      let saving = false;
      const reads: string[] = [];
      globalThis.fetch = async (url, init) => {
        const path = String(url);
        const method = init?.method ?? "GET";
        if (saving && method === "GET") { reads.push(path); started.resolve(); await refresh.promise; }
        if (kind === "partial launch" && method === "POST" && path === "/api/projects") { return new Response("failed", { status: 400 }); }
        const result = await api.request(method, path, init?.body ? JSON.parse(String(init.body)) : undefined);
        return Response.json(result.data, { status: result.status });
      };
      let root: ReactTestRenderer | undefined;
      const subscriptions: Array<() => void> = [];
      try {
        const allOptions = options();
        for (const option of allOptions) { await qc.ensureQueryData(option as Parameters<QueryClient["ensureQueryData"]>[0]); }
        const organization = qc.getQueryData<Organization>(organizations.organizationKey("org-1"))!;
        const project = qc.getQueryData<Project>(projects.projectKey("project-1"))!;
        const task = qc.getQueryData<Task>(tasks.taskKey("task-1"))!;
        if (active) {
          for (const option of allOptions) {
            const observer = new QueryObserver(qc, option as Parameters<QueryClient["ensureQueryData"]>[0]);
            subscriptions.push(observer.subscribe(() => {}));
          }
        }
        // Each scenario mounts the real domain hook. The selected hook stays fixed for the mount.
        const hooks = {
          organization: () => { return useOrganizationForm({ resource: organization }); },
          profile: () => { return useOrganizationProfileForm({ organizationId: organization.id }); },
          operations: () => { return useOrganizationOperationsForm({ organizationId: organization.id }); },
          project: () => { return useProjectForm({ resource: project, organizationId: organization.id }); },
          task: () => { return useTaskForm({ resource: task, project }); },
          "new organization": () => { return useOrganizationForm({}); },
          "new project": () => { return useProjectForm({ organizationId: organization.id }); },
          "new task": () => { return useTaskForm({ project }); },
          launch: () => { return useWorkspaceLaunchForms(() => {}); },
          "partial launch": () => { return useWorkspaceLaunchForms(() => {}); },
        };
        let current: any;
        const Harness = () => { current = hooks[kind](); return null; };
        await act(async () => { root = create(<QueryClientProvider client={qc}><Harness /></QueryClientProvider>); });
        const editedKey = kind === "organization" ? organizations.organizationKey(organization.id)
          : kind === "profile" ? organizations.organizationProfileKey(organization.id)
          : kind === "operations" ? organizations.organizationOperationsKey(organization.id)
          : kind === "project" ? projects.projectKey(project.id)
          : kind === "task" ? tasks.taskKey(task.id) : undefined;
        const expected: QueryKey[] = [bootstrapKey()];
        if (kind.includes("launch")) {
          expected.push(organizations.organizationsKey());
          if (kind === "launch") { expected.push(projects.projectsKey(), projects.organizationProjectsKey("org-1"), projects.organizationProjectsKey("other"), tasks.tasksKey(), tasks.projectTasksKey("project-1"), tasks.projectTasksKey("other")); }
        } else if (kind.includes("project")) { expected.push(projects.projectsKey(), projects.organizationProjectsKey(organization.id)); }
        else if (kind.includes("task")) { expected.push(tasks.tasksKey(), tasks.projectTasksKey(project.id)); }
        else {
          expected.push(organizations.organizationsKey());
          if (!kind.startsWith("new")) { expected.push(organizations.organizationKey(organization.id)); }
          if (kind === "organization") { expected.push(organizations.organizationProfileKey(organization.id), organizations.organizationOperationsKey(organization.id)); }
        }
        if (editedKey && !expected.some((key) => { return sameKey(key, editedKey); })) { expected.push(editedKey); }
        await act(async () => {
          if (kind.includes("launch")) { current.project.form.setFieldValue("name", "Launch project edit"); current.task.form.setFieldValue("title", "Launch task edit"); }
          else { current.form.setFieldValue(kind === "profile" ? "displayName" : kind === "operations" ? "isActive" : kind.includes("task") ? "title" : "name", kind === "operations" ? false : "Saved edit"); }
        });
        saving = true;
        let finished = false;
        let pending!: Promise<unknown>;
        const mountedKeys = active ? expected : kind.includes("launch") ? [bootstrapKey()] : editedKey ? [editedKey] : [];
        await act(async () => {
          const result = kind === "profile" || kind === "operations"
            ? submitChild(qc, current)
            : kind.includes("launch") ? current.save.submit() : current.submit();
          pending = result.then(() => { finished = true; });
          if (mountedKeys.length) { await started.promise; }
          else { await pending; }
        });
        if (mountedKeys.length) { assert.equal(finished, false); }
        await act(async () => { refresh.resolve(); await pending; });
        assert.equal(finished, true);
        assert.equal(reads.length, mountedKeys.length, "each active affected query refreshes once");
        for (const option of allOptions) {
          const affected = expected.some((key) => { return sameKey(key, option.queryKey); });
          const mounted = mountedKeys.some((key) => { return sameKey(key, option.queryKey); });
          assert.equal(qc.getQueryState(option.queryKey)?.isInvalidated, affected && !mounted, JSON.stringify(option.queryKey));
        }
        if (kind === "partial launch") {
          assert.equal(current.save.result.outcome, "partial-failure");
          assert.equal(current.project.form.state.values.name, "Launch project edit");
          assert.equal(current.project.form.state.isDirty, true);
          assert.equal(current.task.form.state.isDirty, true);
        }
      } finally {
        refresh.resolve();
        await act(async () => { root?.unmount(); });
        for (const unsubscribe of subscriptions) { unsubscribe(); }
        qc.clear(); globalThis.fetch = original;
      }
    });
  }
}

import { createOrchestrator } from "../src/forms/orchestration/orchestrator";
const submitChild = async (qc: QueryClient, binding: ReturnType<typeof useOrganizationProfileForm> | ReturnType<typeof useOrganizationOperationsForm>) => {
  return createOrchestrator(qc).submit({ forms: [binding] });
};
