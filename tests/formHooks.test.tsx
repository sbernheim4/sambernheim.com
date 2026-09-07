import { taskKey } from "../src/features/workspace/tasks/queryOptions";
import { organizationKey, organizationProfileKey } from "../src/features/workspace/organizations/queryOptions";
import { test } from "node:test";
import assert from "node:assert/strict";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useQueryBackedForm } from "../src/forms/hooks/useQueryBackedForm";
import { useFormOrchestrator } from "../src/forms/hooks/useFormOrchestrator";
import { useOrganizationForm } from "../src/features/workspace/organizations/hooks/useOrganizationForm";
import {
  useOrganizationProfileForm,
  useOrganizationOperationsForm,
} from "../src/features/workspace/organizations/hooks/organizationConfigurationForms";
import { useCreateOrganization } from "../src/features/workspace/organizations/hooks/mutations";
import { useWorkspaceLaunchForms } from "../src/features/workspace/hooks/useWorkspaceLaunchForms";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const client = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: 4, gcTime: Infinity },
    },
  });
const delay = () => new Promise<void>((r) => setTimeout(r, 10));
const gate = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { resolve, promise };
};
async function mount(qc: QueryClient, render: () => React.ReactNode) {
  function Harness() {
    return render();
  }
  let root!: ReactTestRenderer;
  await act(async () => {
    root = create(
      <QueryClientProvider client={qc}>
        <Harness />
      </QueryClientProvider>,
    );
  });
  return {
    update: async () => {
      await act(async () => {
        root.update(
          <QueryClientProvider client={qc}>
            <Harness />
          </QueryClientProvider>,
        );
      });
    },
    dispose: async () => {
      await act(async () => root.unmount());
      qc.clear();
    },
  };
}

test("saving awaits native live field and form validation and clears errors on correction", async () => {
  const qc = client();
  const validation = gate();
  let writes = 0;
  let fieldValidationStarted = false;
  let current: any;
  const harness = await mount(qc, () => {
    current = useQueryBackedForm({
      defaultValues: { name: "" },
      validate: async (values) => {
        await validation.promise;
        return values.name === "bad" ? "form error" : undefined;
      },
      endpoint: {
        mutationFn: async (values: { name: string }) => {
          writes++;
          return values;
        },
      },
    });
    return (
      <current.form.AppField
        name="name"
        validators={{
          onSubmitAsync: async ({ value, fieldApi }: any) => {
            assert.equal(fieldApi.form.store, current.form.store);
            fieldValidationStarted = true;
            await validation.promise;
            return !value ? "field error" : undefined;
          },
        }}
      >
        {() => null}
      </current.form.AppField>
    );
  });
  try {
    let pending!: Promise<unknown>;
    await act(async () => {
      pending = current.submit();
      await delay();
    });
    assert.equal(current.isSaving, true);
    assert.equal(fieldValidationStarted, true);
    assert.equal(writes, 0);
    await act(async () => {
      validation.resolve();
      await pending;
    });
    assert.equal(current.result.outcome, "validation-failed");
    assert.deepEqual(current.form.getFieldMeta("name").errors, ["field error"]);
    assert.equal(writes, 0);

    await act(async () => {
      current.form.setFieldValue("name", "bad");
      await current.submit();
    });
    assert.equal(current.result.outcome, "validation-failed");
    assert.deepEqual(current.form.state.errors, ["form error"]);
    assert.equal(writes, 0);

    await act(async () => {
      current.form.setFieldValue("name", "good");
      await current.form.handleSubmit();
    });
    assert.equal(current.result.outcome, "success");
    assert.deepEqual(current.form.state.errors, []);
    assert.deepEqual(current.form.getFieldMeta("name").errors, []);
    assert.equal(writes, 1);
  } finally {
    validation.resolve();
    await harness.dispose();
  }
});

test("CRUD query selection initializes mapped values, preserves dirty edits and marks only submitted values as saved", async () => {
  const qc = client();
  const loaded = gate();
  const refreshed = gate();
  let callback = 0;
  let writes = 0;
  // Use a typed capture without altering the hook's own inferred types.
  let current: any;
  const harness = await mount(qc, () => {
    const query = useQuery({
      queryKey: ["read"],
      queryFn: async () => {
        await loaded.promise;
        return { envelope: { name: "server" } };
      },
      select: (data) => data.envelope,
    });
    current = useQueryBackedForm({
      defaultValues: { display: "" },
      query,
      toFormData: (data) => ({ display: data.name }),
      toMutationPayload: (v) => ({ name: v.display }),
      endpoint: {
        mutationFn: async (v: { name: string }) => {
          writes++;
          return v;
        },
      },
      refetchFunctions: [() => refreshed.promise],
      cacheUpdates: [{ queryKey: () => ["read"], getData: (r) => ({ envelope: r }) }],
      onSuccess: () => {
        callback++;
      },
    });
    return <current.form.AppField name="display">{() => null}</current.form.AppField>;
  });
  try {
    assert.equal(current.isReady, false);
    await act(async () => {
      loaded.resolve();
      await delay();
    });
    assert.equal(current.isReady, true);
    assert.deepEqual(current.form.state.values, { display: "server" });
    await act(async () => {
      current.form.setFieldValue("display", "edit");
      qc.setQueryData(["read"], { envelope: { name: "background" } });
      await delay();
    });
    assert.equal(current.form.state.values.display, "edit");
    let pending: Promise<any>;
    await act(async () => {
      pending = current.submit();
      await delay();
    });
    assert.equal(current.isSaving, true);
    await act(async () => {
      current.form.setFieldValue("display", "later");
      refreshed.resolve();
      await pending!;
      await delay();
    });
    assert.equal(writes, 1);
    assert.equal(callback, 1);
    assert.equal(current.isSaving, false);
    assert.equal(current.form.state.values.display, "later");
    assert.equal(current.form.state.isDirty, true);
    assert.deepEqual(current.form.options.defaultValues, { display: "edit" });
    assert.deepEqual(qc.getQueryData(["read"]), { envelope: { name: "edit" } });
  } finally {
    await harness.dispose();
  }
});

test("domain create mutateAsync owns one mutation, overrides inherited retries and aggregate state includes refresh/effects", async () => {
  const original = globalThis.fetch;
  const qc = client();
  const refresh = gate();
  let calls = 0;
  let successes = 0;
  let current: any;
  let mutation: any;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ organization: { id: "new" }, readModelLagMs: 2500 });
  };
  const harness = await mount(qc, () => {
    mutation = useCreateOrganization();
    current = useQueryBackedForm({
      defaultValues: {
        name: "N",
        sector: "healthcare" as const,
        status: "active" as const,
        region: "east" as const,
      },
      endpoint: {
        mutationFn: mutation.mutateAsync,
      },
      refetchFunctions: [() => refresh.promise],
      onSuccess: () => {
        successes++;
      },
    });
    return null;
  });
  try {
    let pending: Promise<any>;
    await act(async () => {
      pending = current.submit();
      await delay();
    });
    assert.equal(mutation.isPending, false);
    assert.equal(current.isSaving, true);
    assert.equal(qc.getMutationCache().getAll().length, 1);
    assert.equal(qc.getMutationCache().getAll()[0].options.retry, false);
    await act(async () => {
      refresh.resolve();
      await pending!;
    });
    assert.equal(calls, 1);
    assert.equal(successes, 1);
    assert.equal(current.isSaving, false);
  } finally {
    globalThis.fetch = original;
    await harness.dispose();
  }
});

test("composed domain forms retry only Operations, keep Profile success and preserve failed edits", async () => {
  const qc = client();
  const original = globalThis.fetch;
  const log: string[] = [];
  let current: any;
  const organization = {
    id: "org-1",
    name: "Old",
    sector: "healthcare",
    status: "active",
    region: "east",
    updatedAt: "1",
    profileUpdatedAt: "1",
    operationsUpdatedAt: "1",
  };
  globalThis.fetch = async (url, options) => {
    const path = String(url);
    const patch = options?.method === "PATCH";
    if (patch) {
      log.push(path.endsWith("profile") ? "profile request" : "operations request");
      if (path.endsWith("operations")) return new Response("Unavailable", { status: 503 });
      return Response.json({
        profile: {
          organizationId: "org-1",
          ...JSON.parse(String(options.body)),
          updatedAt: "2",
        },
        readModelLagMs: 2500,
      });
    }
    if (path.endsWith("/profile"))
      return Response.json({
        organizationId: "org-1",
        name: "Old",
        sector: "healthcare",
        updatedAt: "1",
      });
    if (path.endsWith("/operations"))
      return Response.json({
        organizationId: "org-1",
        status: "active",
        region: "east",
        updatedAt: "1",
      });
    return Response.json(organization);
  };
  const harness = await mount(qc, () => {
    const profile = useOrganizationProfileForm({
      organizationId: "org-1",
      onSuccess: () => {
        log.push("profile success");
      },
    });
    const operations = useOrganizationOperationsForm({
      organizationId: "org-1",
      onFailure: () => {
        log.push("operations failure");
      },
    });
    const save = useFormOrchestrator({
      forms: [profile, operations],
      retry: { delayMs: 0 },
      onFailure: () => {
        log.push("group failure");
      },
    });
    current = { profile, operations, save };
    return null;
  });
  try {
    await act(delay);
    assert.equal(current.profile.isReady, true);
    assert.equal(current.operations.isReady, true);
    await act(async () => {
      current.profile.form.setFieldValue("displayName", "Saved");
      current.operations.form.setFieldValue("isActive", false);
    });
    await act(async () => {
      await current.save.submit();
      await delay();
    });
    assert.deepEqual(log, [
      "profile request",
      "operations request",
      "operations request",
      "profile success",
      "operations failure",
      "group failure",
    ]);
    assert.equal(current.save.result.outcome, "partial-failure");
    assert.equal(current.profile.form.state.values.displayName, "Saved");
    assert.equal(current.operations.form.state.values.isActive, false);
    assert.equal(qc.getQueryData<any>(organizationKey("org-1")).name, "Saved");
  } finally {
    globalThis.fetch = original;
    await harness.dispose();
  }
});

test("organization page orchestrator skips clean forms and only submits dirty forms", async () => {
  const qc = client();
  const original = globalThis.fetch;
  const requests: string[] = [];
  let current: any;
  globalThis.fetch = async (url, options) => {
    const path = String(url);
    const method = options?.method ?? "GET";
    if (path.endsWith("/organizations/org-1/profile") && method === "GET")
      return Response.json({
        organizationId: "org-1",
        name: "Existing Clinic",
        sector: "healthcare",
        updatedAt: "1",
      });
    if (path.endsWith("/organizations/org-1/operations") && method === "GET")
      return Response.json({
        organizationId: "org-1",
        status: "active",
        region: "east",
        updatedAt: "1",
      });
    if (path.endsWith("/organizations/org-1") && method === "GET")
      return Response.json({
        id: "org-1",
        name: "Existing Clinic",
        sector: "healthcare",
        status: "active",
        region: "east",
        updatedAt: "1",
        profileUpdatedAt: "1",
        operationsUpdatedAt: "1",
      });
    if (path.endsWith("/organizations/org-1") && method === "PATCH") {
      requests.push("organization patch");
      return Response.json({
        organization: {
          id: "org-1",
          name: "Existing Clinic",
          sector: "healthcare",
          status: "active",
          region: "east",
          updatedAt: "2",
          profileUpdatedAt: "1",
          operationsUpdatedAt: "1",
        },
        readModelLagMs: 2500,
      });
    }
    if (path.endsWith("/organizations/org-1/profile") && method === "PATCH") {
      requests.push("profile patch");
      return Response.json({
        profile: {
          organizationId: "org-1",
          ...JSON.parse(String(options?.body)),
          updatedAt: "2",
        },
        readModelLagMs: 2500,
      });
    }
    if (path.endsWith("/organizations/org-1/operations") && method === "PATCH") {
      requests.push("operations patch");
      return Response.json({
        operations: {
          organizationId: "org-1",
          status: "active",
          region: "east",
          updatedAt: "2",
        },
        readModelLagMs: 2500,
      });
    }
    throw new Error(`Unexpected request: ${method} ${path}`);
  };
  const harness = await mount(qc, () => {
    const organization = useOrganizationForm({
      resource: {
        id: "org-1",
        name: "Existing Clinic",
        sector: "healthcare",
        status: "active",
        region: "east",
        updatedAt: "1",
        profileUpdatedAt: "1",
        operationsUpdatedAt: "1",
      },
    });
    const profile = useOrganizationProfileForm({
      organizationId: "org-1",
      onSuccess: () => {
        requests.push("profile success");
      },
    });
    const operations = useOrganizationOperationsForm({
      organizationId: "org-1",
      onSuccess: () => {
        requests.push("operations success");
      },
    });
    const save = useFormOrchestrator({
      forms: [organization, profile, operations] as const,
      retry: { delayMs: 0 },
      onSuccess: () => {
        requests.push("group success");
      },
    });
    current = { organization, profile, operations, save };
    return null;
  });
  try {
    await act(delay);
    assert.equal(current.organization.form.state.isDirty, false);
    assert.equal(current.profile.form.state.isDirty, false);
    assert.equal(current.operations.form.state.isDirty, false);
    await act(async () => {
      current.profile.form.setFieldValue("displayName", "Renamed Clinic");
      await delay();
    });
    assert.equal(current.profile.form.state.isDirty, true);
    await act(async () => {
      await current.save.submit();
      await delay();
    });
    assert.deepEqual(requests, ["profile patch", "profile success", "group success"]);
    assert.equal(current.save.result.outcome, "success");
    assert.equal(current.organization.form.state.isDirty, false);
    assert.equal(current.profile.form.state.isDirty, false);
    assert.equal(current.operations.form.state.isDirty, false);
    assert.equal(
      qc.getQueryData<any>(organizationProfileKey("org-1")).name,
      "Renamed Clinic",
    );
  } finally {
    globalThis.fetch = original;
    await harness.dispose();
  }
});

test("query-backed creates resolve dynamic cache keys and run success after refresh and cache updates", async () => {
  const qc = client();
  const log: string[] = [];
  let current: any;
  const harness = await mount(qc, () => {
    current = useQueryBackedForm({
      defaultValues: { name: "A", organizationId: "org-1" },
      endpoint: {
        mutationFn: async (v: { name: string; organizationId: string }) => ({
          id: "created-1",
          name: v.name,
        }),
      },
      refetchFunctions: [
        async () => {
          log.push("refresh");
        },
      ],
      cacheUpdates: [
        {
          queryKey: ({ response, variables }) => [
            "organizations",
            variables.organizationId,
            "resources",
            response.id,
          ],
        },
      ],
      onSuccess: ({ response, variables, queryClient }) => {
        assert.deepEqual(
          queryClient.getQueryData([
            "organizations",
            variables.organizationId,
            "resources",
            response.id,
          ]),
          response,
        );
        log.push("success");
      },
    });
    return null;
  });
  try {
    assert.equal(current.isReady, true);
    await act(async () => {
      await current.form.handleSubmit();
    });
    assert.deepEqual(log, ["refresh", "success"]);
    assert.deepEqual(qc.getQueryData(["organizations", "org-1", "resources", "created-1"]), {
      id: "created-1",
      name: "A",
    });
  } finally {
    await harness.dispose();
  }
});

test("read errors and query mapping errors block writes and release the submission lock", async () => {
  for (const mappingError of [false, true]) {
    const qc = client();
    let current: any;
    let failures = 0;
    let maps = 0;
    const harness = await mount(qc, () => {
      const query = useQuery({
        queryKey: ["read-error"],
        queryFn: async () => {
          if (!mappingError) throw new Error("read failed");
          return { name: "A" };
        },
      });
      current = useQueryBackedForm({
        defaultValues: { name: "" },
        query,
        toFormData: (data) => {
          maps++;
          if (mappingError) throw new Error("mapping failed");
          return { name: data.name };
        },
        endpoint: {
          mutationFn: async (_input: { name: string }) => assert.fail("no writes"),
        },
        onFailure: () => {
          failures++;
        },
      });
      return null;
    });
    try {
      await act(delay);
      assert.equal(current.isReady, false);
      await act(async () => {
        await current.submit();
      });
      assert.equal(current.result.outcome, "validation-failed");
      assert.equal(current.isSaving, false);
      assert.equal(failures, 1);
      if (!mappingError) assert.equal(maps, 0);
    } finally {
      await harness.dispose();
    }
  }
});

for (const failProject of [false, true]) {
  test(`workspace launch composes entity forms with dependent IDs (${failProject ? "partial failure" : "success"})`, async () => {
    const qc = client();
    const original = globalThis.fetch;
    const writes: Array<{ path: string; input: Record<string, unknown> }> = [];
    const activity: string[] = [];
    let current!: ReturnType<typeof useWorkspaceLaunchForms>;
    globalThis.fetch = async (url, options) => {
      const path = String(url);
      if (options?.method !== "POST")
        return Response.json({ organizations: [], projects: [], tasks: [] });
      const input = JSON.parse(String(options.body));
      writes.push({ path, input });
      if (failProject && path === "/api/projects")
        return new Response("Project creation failed", { status: 500 });
      const entity =
        path === "/api/organizations"
          ? "organization"
          : path === "/api/projects"
            ? "project"
            : "task";
      return Response.json({
        [entity]: {
          ...input,
          id: `${entity}-new`,
          updatedAt: "2026-09-05T12:00:00Z",
        },
        readModelLagMs: 2500,
      });
    };
    const harness = await mount(qc, () => {
      current = useWorkspaceLaunchForms((text) => activity.push(text));
      return null;
    });
    try {
      assert.notEqual(current.organization.form, current.project.form);
      assert.notEqual(current.project.form, current.task.form);
      assert.equal(current.organization.form.state.isDirty, false);
      if (failProject) {
        await act(async () => {
          current.project.form.setFieldValue("name", "Edited project");
          current.task.form.setFieldValue("title", "Edited task");
        });
      }
      await act(async () => {
        await current.save.submit();
      });
      const result = current.save.result!;
      assert.deepEqual(
        writes.map(({ path }) => path),
        failProject
          ? ["/api/organizations", "/api/projects"]
          : ["/api/organizations", "/api/projects", "/api/tasks"],
      );
      assert.equal(writes[1].input.organizationId, "organization-new");
      assert.equal(result.forms.organization.status, "saved");
      assert.equal(
        qc.getQueryData<{ id: string }>(organizationKey("organization-new"))?.id,
        "organization-new",
      );
      assert.equal(current.save.isSaving, false);
      if (failProject) {
        assert.equal(result.outcome, "partial-failure");
        assert.equal(result.forms.project.attempts, 1);
        assert.equal(result.forms.project.status, "failed");
        assert.equal(result.forms.task.status, "skipped");
        assert.equal(current.project.form.state.isDirty, true);
        assert.equal(current.task.form.state.values.title, "Edited task");
        assert.deepEqual(activity, [
          "Saved organization: Acme Health",
          "Workspace creation failed. See the save results.",
        ]);
      } else {
        assert.equal(result.outcome, "success");
        assert.equal(writes[2].input.organizationId, "organization-new");
        assert.equal(writes[2].input.projectId, "project-new");
        assert.equal(
          qc.getQueryData<{ id: string }>(taskKey("task-new"))?.id,
          "task-new",
        );
        assert.deepEqual(activity, [
          "Saved organization: Acme Health",
          "Saved project: Patient Intake",
          "Saved task: Provision workspace",
          "Workspace created: Acme Health",
        ]);
      }
    } finally {
      globalThis.fetch = original;
      await harness.dispose();
    }
  });
}

test("query sync uses TanStack dirty state and retains saved defaults across rerenders", async () => {
  const qc = client();
  let serverName = "initial";
  let current: any;
  const harness = await mount(qc, () => {
    const query = useQuery({
      queryKey: ["native-defaults"],
      queryFn: async () => ({ name: serverName }),
    });
    const binding = useQueryBackedForm({
      defaultValues: { name: "" },
      query,
      endpoint: { mutationFn: async (values: { name: string }) => values },
    });
    current = { binding, query };
    return <binding.form.AppField name="name">{() => null}</binding.form.AppField>;
  });
  const refetch = async (name: string) => {
    serverName = name;
    await act(async () => {
      await current.query.refetch();
      await delay();
    });
  };
  try {
    await act(delay);
    assert.equal(current.binding.form.state.values.name, "initial");
    await refetch("remote update");
    assert.equal(current.binding.form.state.values.name, "remote update");
    assert.equal(current.binding.form.state.isDirty, false);
    assert.deepEqual(current.binding.form.options.defaultValues, { name: "remote update" });

    await act(async () => {
      current.binding.form.setFieldValue("name", "local edit");
    });
    await refetch("another remote update");
    assert.equal(current.binding.form.state.values.name, "local edit");
    assert.deepEqual(current.binding.form.options.defaultValues, { name: "remote update" });

    await act(async () => {
      await current.binding.save();
    });
    await harness.update();
    assert.equal(current.binding.form.state.isDirty, false);
    assert.equal(current.binding.form.state.isDefaultValue, true);
    assert.deepEqual(current.binding.form.options.defaultValues, { name: "local edit" });
    await act(async () => current.binding.form.reset());
    assert.equal(current.binding.form.state.values.name, "local edit");

    await refetch("latest remote update");
    assert.equal(current.binding.form.state.values.name, "latest remote update");
    assert.equal(current.binding.form.state.isDirty, false);
  } finally {
    await harness.dispose();
  }
});
