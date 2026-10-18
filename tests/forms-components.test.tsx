import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { CycleableDateTime, CycleableDateTimeProvider, FormEditor } from "../src/forms/components";
import { Number as FormattedNumber } from "../src/shared/components/Number";
import { TooltipProvider } from "../src/shared/components/ui/tooltip";

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
    <TooltipProvider>
      <FormEditor.Provider mode="edit" defaultTab="profile" actions={actions}>
        <FormEditor.OrchestratorProgress />
      </FormEditor.Provider>
    </TooltipProvider>,
  );

  expect(screen.getByTestId("orchestrator-diagnostics")).toHaveTextContent("run-123");
  expect(screen.getAllByText("Attempts: 2 · save: request failed")).toHaveLength(2);
  expect(screen.getByText("1 follow-up error(s)")).toBeInTheDocument();
});

test("CycleableDateTime titles each display mode", async () => {
  const user = userEvent.setup();
  render(
    <TooltipProvider>
      <CycleableDateTimeProvider>
        <CycleableDateTime value="2026-09-22T12:00:00.000Z" />
      </CycleableDateTimeProvider>
    </TooltipProvider>,
  );
  const control = screen.getByRole("button");
  expect(control).toHaveAttribute(
    "aria-label",
    expect.stringContaining("Format: UTC. Click to toggle between UTC, Local, and Relative."),
  );
  await user.click(control);
  expect(control).toHaveAttribute(
    "aria-label",
    expect.stringContaining(
      "Format: Relative. Click to toggle between UTC, Local, and Relative.",
    ),
  );
  await user.click(control);
  expect(control).toHaveAttribute(
    "aria-label",
    expect.stringContaining(
      "Format: Local. Click to toggle between UTC, Local, and Relative.",
    ),
  );
});

test("Number formats values using the requested locale", () => {
  render(
    <>
      <FormattedNumber value={30000} locale="en-US" data-testid="us-number" />
      <FormattedNumber value={30000} locale="fr-FR" data-testid="fr-number" />
    </>,
  );

  expect(screen.getByTestId("us-number")).toHaveTextContent("30,000");
  expect(screen.getByTestId("fr-number").textContent).toBe(
    new Intl.NumberFormat("fr-FR").format(30000),
  );
});
