import { test } from "node:test";
import { strict as assert } from "node:assert";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOrganizationsWorkspace } from "../src/features/workspace/organizations/hooks/useOrganizationsWorkspace";
import { useOrganizationWorkspace } from "../src/features/workspace/organizations/hooks/useOrganizationWorkspace";
import { useProjectWorkspace } from "../src/features/workspace/projects/hooks/useProjectWorkspace";
import { useTaskWorkspace } from "../src/features/workspace/tasks/hooks/useTaskWorkspace";
import { apiHarness } from "./workspaceApiHarness";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("page hooks expose individual related records and correctly scoped lists across navigation", async () => {
  const api = apiHarness();
  const createdOrganization = (
    await api.request("POST", "/api/organizations", {
      name: "Other",
      sector: "finance",
      region: "west",
      status: "active",
    })
  ).data.organization;
  const organization = (await api.request("GET", `/api/organizations/${createdOrganization.id}`))
    .data;
  const project = (
    await api.request("POST", "/api/projects", {
      organizationId: organization.id,
      name: "Other project",
      phase: "planning",
      priority: "low",
      budget: "$50k",
    })
  ).data.project;
  const task = (
    await api.request("POST", "/api/tasks", {
      organizationId: organization.id,
      projectId: project.id,
      title: "Other task",
      owner: "alex",
      status: "todo",
      dueWindow: "this-week",
    })
  ).data.task;
  const qc = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false, staleTime: Infinity } },
  });
  const original = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async (url) => {
    requests.push(String(url));
    const result = await api.request("GET", String(url));
    return Response.json(result.data, { status: result.status });
  };
  let root!: ReactTestRenderer;
  let current!: {
    organizations: ReturnType<typeof useOrganizationsWorkspace>;
    organization: ReturnType<typeof useOrganizationWorkspace>;
    project: ReturnType<typeof useProjectWorkspace>;
    task: ReturnType<typeof useTaskWorkspace>;
  };
  const Harness = ({
    organizationId,
    projectId,
    taskId,
  }: {
    organizationId: string;
    projectId: string;
    taskId: string;
  }) => {
    current = {
      organizations: useOrganizationsWorkspace(),
      organization: useOrganizationWorkspace(organizationId),
      project: useProjectWorkspace(projectId),
      task: useTaskWorkspace(taskId),
    };
    return null;
  };
  const render = (organizationId: string, projectId: string, taskId: string) => {
    return (
      <QueryClientProvider client={qc}>
        <Harness organizationId={organizationId} projectId={projectId} taskId={taskId} />
      </QueryClientProvider>
    );
  };
  const settle = async () => {
    // Dependent queries subscribe after their parent record arrives.
    for (let attempt = 0; attempt < 20; attempt++) {
      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 5);
        });
      });
      if (
        Object.values(current).every((page) => {
          return page.hasData;
        })
      ) {
        return;
      }
    }
    assert.fail("Page reads did not settle");
  };
  try {
    await act(async () => {
      root = create(render("org-1", "project-1", "task-1"));
    });
    await settle();
    assert.equal(current.organizations.organizations.length, 2);
    assert.equal(current.organizations.projects.length, 2);
    assert.equal(current.organization.organization?.id, "org-1");
    assert.deepEqual(
      current.organization.projects.map((item) => {
        return item.id;
      }),
      ["project-1"],
    );
    assert.equal(current.project.project?.id, "project-1");
    assert.equal(current.project.organization?.id, "org-1");
    assert.deepEqual(
      current.project.tasks.map((item) => {
        return item.id;
      }),
      ["task-1"],
    );
    assert.equal(current.task.task?.id, "task-1");
    assert.equal(current.task.project?.id, "project-1");
    assert.equal(current.task.organization?.id, "org-1");
    await act(async () => {
      root.update(render(organization.id, project.id, task.id));
    });
    await settle();
    assert.deepEqual(current.organization.organization, organization);
    assert.deepEqual(current.organization.projects, [project]);
    assert.deepEqual(current.project.project, project);
    assert.deepEqual(current.project.organization, organization);
    assert.deepEqual(current.project.tasks, [task]);
    assert.deepEqual(current.task.task, task);
    assert.deepEqual(current.task.project, project);
    assert.deepEqual(current.task.organization, organization);
    assert.equal(
      requests.some((path) => {
        return path.endsWith("/") || path.includes("undefined");
      }),
      false,
    );
  } finally {
    await act(async () => {
      root?.unmount();
    });
    globalThis.fetch = original;
    qc.clear();
  }
});
