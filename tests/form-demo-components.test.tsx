import assert from "node:assert/strict";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { DetailTabs } from "../src/routes/form-demo/components/-DetailTabs";
import { DetailView } from "../src/routes/form-demo/components/-DetailView";
import { ChildList } from "../src/routes/form-demo/components/-DetailHelpers";
import { Loading, Missing, Status } from "../src/routes/form-demo/components/-Layout";
import {
  ViewModePicker,
  useViewModePreference,
} from "../src/routes/form-demo/components/-ViewModePreference";
import { profileToForm } from "../src/domains/execution-profiles/components/ExecutionProfileFields";
import { processToForm } from "../src/domains/processes/components/ProcessFields";
import { taskToForm } from "../src/domains/tasks/components/TaskFields";
import { threadToForm } from "../src/domains/threads/components/ThreadFields";

test("ViewModePicker reports the selected mode and changes mode", async () => {
  const user = userEvent.setup();
  const changed: string[] = [];
  render(
    <ViewModePicker
      mode="page"
      onChange={(mode) => {
        changed.push(mode);
      }}
    />,
  );
  expect(screen.getByRole("button", { name: "Tabs" })).not.toBePressed();
  expect(screen.getByRole("button", { name: "Full page" })).toBePressed();
  await user.click(screen.getByRole("button", { name: "Tabs" }));
  await user.click(screen.getByRole("button", { name: "Full page" }));
  assert.deepEqual(changed, ["tabs", "page"]);
});

test("view mode preference reads persisted page mode and writes updates", async () => {
  window.localStorage.setItem("form-demo:view-mode", "page");
  let current: ReturnType<typeof useViewModePreference> | undefined;
  const Harness = () => {
    current = useViewModePreference();
    return <span>{current.mode}</span>;
  };
  const user = userEvent.setup();
  render(<Harness />);
  expect(await screen.findByText("page")).toBeInTheDocument();
  await user.click(screen.getByText("page"));
  await act(async () => {
    current!.updateMode("tabs");
  });
  expect(screen.getByText("tabs")).toBeInTheDocument();
  assert.equal(window.localStorage.getItem("form-demo:view-mode"), "tabs");
});

test("DetailTabs shows the first panel and exposes the other tab", () => {
  render(
    <DetailTabs
      tabs={[
        { value: "overview", label: "Overview", children: <span>Overview content</span> },
        { value: "activity", label: "Activity", children: <span>Activity content</span> },
      ]}
    />,
  );
  expect(screen.getByRole("tablist")).toHaveClass("segmented-tabs-list");
  expect(screen.getByRole("tab", { name: "Overview" })).toHaveClass("segmented-tab-trigger");
  expect(screen.getByText("Overview content")).toBeVisible();
  expect(screen.queryByText("Activity content")).not.toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Activity" })).toBeInTheDocument();
});

test("DetailView switches from tabs to full-page sections", async () => {
  const user = userEvent.setup();
  render(
    <DetailView
      tabs={[
        { value: "one", label: "One", children: <span>First section</span> },
        { value: "two", label: "Two", children: <span>Second section</span> },
      ]}
    />,
  );
  expect(screen.getByRole("tablist")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Full page" }));
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  expect(screen.getByText("First section")).toBeVisible();
  expect(screen.getByText("Second section")).toBeVisible();
});

test("form-demo layout primitives render state labels", () => {
  render(
    <>
      <Status value="running" />
      <Loading />
      <Missing />
      <ChildList>
        <span>child</span>
      </ChildList>
    </>,
  );
  expect(screen.getByText("running")).toBeInTheDocument();
  expect(screen.getByText("Loading...")).toBeInTheDocument();
  expect(screen.getByText("Entity not found.")).toBeInTheDocument();
  expect(screen.getByText("child").parentElement).toHaveClass("relationship-list");
});

test("demo field conversion functions preserve records and convert numeric values", () => {
  const profile = profileToForm({
    id: "p",
    name: "P",
    runtime: "node-22",
    region: "us-east",
    timeoutMs: 5000,
    memoryLimitMb: 512,
  });
  assert.equal(profile.timeoutMs, "5000");
  assert.equal(profile.memoryLimitMb, "512");
  const task = taskToForm({
    id: "t",
    name: "T",
    description: "D",
    status: "queued",
    priority: 4,
    executionProfileId: "p",
  });
  const thread = threadToForm({
    id: "th",
    name: "TH",
    processId: "p",
    entryPoint: "main",
    status: "new",
    priority: 2,
    executionProfileId: "p",
  });
  const process = processToForm({
    id: "pr",
    name: "PR",
    taskId: "t",
    command: "run",
    status: "starting",
    executionProfileId: "p",
  });
  assert.equal(task.priority, "4");
  assert.equal(thread.priority, "2");
  assert.equal(process.command, "run");
});
