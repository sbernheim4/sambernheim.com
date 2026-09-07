import { test } from "node:test";
import { strict as assert } from "node:assert";
import { useEffect } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueryState } from "../src/features/workspace/components/QueryState";
import { RefreshErrorBanner } from "../src/features/workspace/components/RefreshErrorBanner";
import { useOrganizationsWorkspace } from "../src/features/workspace/organizations/hooks/useOrganizationsWorkspace";
import { useOrganizationForm } from "../src/features/workspace/organizations/hooks/useOrganizationForm";
import {
  organizationQueryOptions,
  organizationsQueryOptions,
} from "../src/features/workspace/organizations/queryOptions";
import { projectsKey, projectsQueryOptions } from "../src/features/workspace/projects/queryOptions";
import { apiHarness } from "./workspaceApiHarness";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const flush = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 10);
  });
};

test("a failed background query preserves the mounted dirty form through dismissal and recovery", async () => {
  const api = apiHarness();
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const original = globalThis.fetch;
  let failRead = false;
  let failWrite = false;
  globalThis.fetch = async (url, init) => {
    if ((failRead && String(url) === "/api/projects") || (failWrite && init?.method === "PATCH")) {
      return new Response("Unavailable", { status: 400 });
    }
    const result = await api.request(
      init?.method ?? "GET",
      String(url),
      init?.body ? JSON.parse(String(init.body)) : undefined,
    );
    return Response.json(result.data, { status: result.status });
  };
  let root!: ReactTestRenderer;
  let mounts = 0;
  let unmounts = 0;
  let current!: ReturnType<typeof useOrganizationForm>;
  try {
    const organization = await qc.ensureQueryData(organizationQueryOptions("org-1"));
    await qc.ensureQueryData(organizationsQueryOptions());
    await qc.ensureQueryData(projectsQueryOptions());
    const Editor = () => {
      current = useOrganizationForm({ resource: organization });
      useEffect(() => {
        mounts++;
        return () => {
          unmounts++;
        };
      }, []);
      return (
        <current.form.AppField name="name">
          {(field) => {
            return <input value={field.state.value} readOnly />;
          }}
        </current.form.AppField>
      );
    };
    const Page = () => {
      const query = useOrganizationsWorkspace();
      return (
        <QueryState query={query}>
          <Editor />
        </QueryState>
      );
    };
    await act(async () => {
      root = create(
        <QueryClientProvider client={qc}>
          <Page />
        </QueryClientProvider>,
      );
      await flush();
    });
    await act(async () => {
      current.form.setFieldValue("name", "Unsaved edit");
    });
    const form = current.form;
    failWrite = true;
    await act(async () => {
      await current.submit();
    });
    assert.equal(
      root.root.findAllByType(RefreshErrorBanner).length,
      0,
      "mutation failures stay in form feedback",
    );
    assert.equal(current.form.state.isDirty, true);
    failRead = true;
    await act(async () => {
      await qc.invalidateQueries({ queryKey: projectsKey() });
      await flush();
    });
    assert.equal(root.root.findAllByProps({ role: "status" }).length, 1);
    assert.equal(current.form, form);
    assert.equal(root.root.findByType("input").props.value, "Unsaved edit");
    assert.equal(unmounts, 0);
    await act(async () => {
      root.root.findByProps({ "aria-label": "Dismiss refresh message" }).props.onClick();
    });
    assert.equal(root.root.findAllByProps({ role: "status" }).length, 0);
    assert.equal(current.form.state.values.name, "Unsaved edit");
    await act(async () => {
      await flush();
      await qc.invalidateQueries({ queryKey: projectsKey() });
      await flush();
    });
    assert.equal(
      root.root.findAllByProps({ role: "status" }).length,
      1,
      "a new failure shows a new banner",
    );
    failRead = false;
    await act(async () => {
      const retry = root.root.findAllByType("button").find((button) => {
        return button.children.includes("Retry");
      })!;
      retry.props.onClick();
      await flush();
    });
    assert.equal(root.root.findAllByType(RefreshErrorBanner).length, 0);
    assert.equal(current.form, form);
    assert.equal(current.form.state.isDirty, true);
    assert.equal(mounts, 1);
    assert.equal(unmounts, 0);
  } finally {
    await act(async () => {
      root?.unmount();
    });
    globalThis.fetch = original;
    qc.clear();
  }
});

test("initial query failure keeps the error screen, while cached empty lists allow a refresh banner", async () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response("Unavailable", { status: 400 });
  };
  let root!: ReactTestRenderer;
  const Page = () => {
    const query = useOrganizationsWorkspace();
    return (
      <QueryState query={query}>
        <input defaultValue="Editor" />
      </QueryState>
    );
  };
  try {
    await act(async () => {
      root = create(
        <QueryClientProvider client={qc}>
          <Page />
        </QueryClientProvider>,
      );
      await flush();
    });
    await act(flush);
    assert.equal(
      root.root.findByProps({ role: "alert" }).findByType("h2").children[0],
      "Unable to load resources",
    );
    assert.equal(root.root.findAllByType("input").length, 0);
    await act(async () => {
      qc.setQueryData(organizationsQueryOptions().queryKey, []);
      qc.setQueryData(projectsKey(), []);
      await flush();
      await qc.invalidateQueries({ queryKey: projectsKey() });
      await flush();
    });
    assert.equal(root.root.findAllByType("input").length, 1);
    assert.equal(root.root.findAllByProps({ role: "alert" }).length, 0);
    assert.equal(root.root.findAllByType(RefreshErrorBanner).length, 1);
  } finally {
    await act(async () => {
      root?.unmount();
    });
    globalThis.fetch = original;
    qc.clear();
  }
});

test("refresh banners expire after ten seconds, stay dismissed on rerender, and clean up timers", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let root!: ReactTestRenderer;
  const render = (episode: number, isFetching = false) => {
    return <RefreshErrorBanner key={episode} isFetching={isFetching} onRetry={async () => {}} />;
  };
  try {
    await act(async () => {
      root = create(render(1));
    });
    await act(async () => {
      t.mock.timers.tick(9_999);
    });
    assert.equal(root.root.findAllByProps({ role: "status" }).length, 1);
    await act(async () => {
      t.mock.timers.tick(1);
    });
    assert.equal(root.toJSON(), null);
    await act(async () => {
      root.update(render(1, true));
    });
    assert.equal(root.toJSON(), null);
    await act(async () => {
      root.update(render(2, true));
    });
    assert.equal(root.root.findAllByType("button")[0].props.disabled, true);
    await act(async () => {
      root.root.findByProps({ "aria-label": "Dismiss refresh message" }).props.onClick();
    });
    assert.equal(root.toJSON(), null);
    await act(async () => {
      root.update(render(3));
      root.unmount();
      t.mock.timers.tick(10_000);
    });
  } finally {
    await act(async () => {
      root?.unmount();
    });
    t.mock.timers.reset();
  }
});
