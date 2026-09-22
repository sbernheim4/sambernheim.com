import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { CycleableDateTime, FormEditor } from "../src/forms/components";

test("FormEditor tabs hide inactive content and page mode shows every section", () => {
  const tabs = (
    <>
      <FormEditor.TabList>
        <FormEditor.TabTrigger name="one" label="One" />
      </FormEditor.TabList>
      <FormEditor.Tab name="one">
        <span>first</span>
      </FormEditor.Tab>
      <FormEditor.Tab name="two">
        <span>second</span>
      </FormEditor.Tab>
    </>
  );
  const actions = { onSubmit: () => {}, isSubmitting: false, isPristine: false } as any;
  const { rerender } = render(
    <FormEditor.Provider mode="edit" defaultTab="one" actions={actions}>
      {tabs}
    </FormEditor.Provider>,
  );
  expect(screen.getByRole("tablist")).toHaveClass("segmented-tabs-list");
  expect(screen.getByRole("tab", { name: "One" })).toHaveClass("segmented-tab-trigger");
  expect(screen.getByText("first")).toBeVisible();
  expect(screen.queryByText("second")).not.toBeInTheDocument();
  rerender(
    <FormEditor.Provider mode="edit" defaultTab="one" viewMode="page" actions={actions}>
      {tabs}
    </FormEditor.Provider>,
  );
  expect(screen.getByText("first")).toBeVisible();
  expect(screen.getByText("second")).toBeVisible();
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
});

test("FormEditor error and draft banner expose their actions", async () => {
  const user = userEvent.setup();
  let restored = 0;
  let discarded = 0;
  const draft = {
    hasDraft: true,
    savedAt: "2026-01-01T00:00:00.000Z",
    restore: () => {
      restored += 1;
      return true;
    },
    discard: () => {
      discarded += 1;
    },
    clear: () => {},
  };
  const actions = {
    onSubmit: () => {},
    isSubmitting: false,
    isPristine: false,
    validationErrors: ["invalid name"],
    submitErrors: [new Error("server error")],
  } as any;
  render(
    <FormEditor.Provider mode="edit" defaultTab="entity" actions={actions}>
      <FormEditor.Error />
      <FormEditor.DraftBanner draft={draft} />
    </FormEditor.Provider>,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("invalid name");
  expect(screen.getByRole("alert")).toHaveTextContent("server error");
  await user.click(screen.getByRole("button", { name: "Restore draft" }));
  await user.click(screen.getByRole("button", { name: "Discard draft" }));
  expect([restored, discarded]).toEqual([1, 1]);
});

test("FormEditor progress exposes correlation and failure diagnostics", () => {
  const actions = {
    onSubmit: () => {},
    isSubmitting: true,
    isPristine: false,
    orchestrator: {
      correlationId: "run-123",
      timestamp: Date.parse("2026-09-22T12:00:00.000Z"),
      phase: "saving",
      isSubmitting: true,
      isOpen: true,
      progressDelayMs: 0,
      setProgressDelayMs: () => {},
      close: () => {},
      forms: [
        {
          id: "profile",
          invalidateQueryKeys: [],
          refetchCount: 0,
          cacheUpdateCount: 0,
        },
      ],
      result: {
        forms: {
          profile: {
            status: "failed",
            attempts: 2,
            failure: { phase: "save", error: new Error("request failed") },
          },
        },
        followUpErrors: [
          { phase: "refresh", formId: "profile", error: new Error("refresh failed") },
        ],
      },
    },
  } as any;

  render(
    <FormEditor.Provider mode="edit" defaultTab="profile" actions={actions}>
      <FormEditor.OrchestratorProgress />
    </FormEditor.Provider>,
  );

  expect(screen.getByTestId("orchestrator-diagnostics")).toHaveTextContent("run-123");
  expect(screen.getAllByText("Attempts: 2 · save: request failed")).toHaveLength(2);
  expect(screen.getByText("1 follow-up error(s)")).toBeInTheDocument();
});

test("CycleableDateTime titles each display mode", async () => {
  const user = userEvent.setup();
  render(<CycleableDateTime value="2026-09-22T12:00:00.000Z" />);
  const control = screen.getByRole("button");
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";

  expect(control).toHaveAttribute("title", "Display mode: UTC. Click to change.");
  await user.click(control);
  expect(control).toHaveAttribute("title", `Display mode: ${userTimeZone}. Click to change.`);
  await user.click(control);
  expect(control).toHaveAttribute("title", "Display mode: Relative time. Click to change.");
});
