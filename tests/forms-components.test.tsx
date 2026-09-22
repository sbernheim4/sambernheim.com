import assert from "node:assert/strict";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Form } from "../src/forms/components/FormComponents";
import { FormEditor } from "../src/forms/components";

const baseForm = { handleSubmit: async () => {}, reset: () => {}, state: { isDirty: false } };
const scope = (overrides: Record<string, unknown> = {}) => {
  return { form: baseForm, isReady: true, isSaving: false, isDirty: false, ...overrides } as any;
};

test("Form.SaveButton reflects readiness, dirtiness, and saving state", () => {
  const { rerender } = render(
    <Form.Provider value={scope()}>
      <Form.SaveButton />
    </Form.Provider>,
  );
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.getByRole("button")).toHaveTextContent("No changes to save");
  rerender(
    <Form.Provider
      value={scope({ isDirty: true, form: { ...baseForm, state: { isDirty: true } } })}
    >
      <Form.SaveButton label="Update" />
    </Form.Provider>,
  );
  expect(screen.getByRole("button")).toBeEnabled();
  expect(screen.getByRole("button")).toHaveTextContent("Update");
  rerender(
    <Form.Provider value={scope({ isDirty: true, isSaving: true })}>
      <Form.SaveButton />
    </Form.Provider>,
  );
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.getByRole("button")).toHaveTextContent("Saving...");
});

test("Form.SaveButton can save a pristine form when explicitly allowed", () => {
  render(
    <Form.Provider value={scope({ allowPristineSave: true })}>
      <Form.SaveButton label="Run" />
    </Form.Provider>,
  );
  expect(screen.getByRole("button", { name: "Run" })).toBeEnabled();
});

test("Form.DiscardButton resets dirty forms and invokes discard callbacks", async () => {
  const user = userEvent.setup();
  let resets = 0;
  let changes = 0;
  let discards = 0;
  render(
    <Form.Provider
      value={scope({
        isDirty: true,
        form: {
          ...baseForm,
          state: { isDirty: true },
          reset: () => {
            resets += 1;
          },
        },
        onChange: () => {
          changes += 1;
        },
        onDiscard: () => {
          discards += 1;
        },
      })}
    >
      <Form.DiscardButton />
    </Form.Provider>,
  );
  await user.click(screen.getByRole("button", { name: "Discard changes" }));
  assert.deepEqual([resets, changes, discards], [1, 1, 1]);
});

test("Form.DiscardButton does not reset pristine forms and uses the back label", async () => {
  const user = userEvent.setup();
  let resets = 0;
  render(
    <Form.Provider
      value={scope({
        form: {
          ...baseForm,
          reset: () => {
            resets += 1;
          },
        },
      })}
    >
      <Form.DiscardButton />
    </Form.Provider>,
  );
  await user.click(screen.getByRole("button", { name: "Go back" }));
  assert.equal(resets, 0);
});

test("Form.Shell forwards rejected submissions", async () => {
  let submits = 0;
  let changes = 0;
  let receivedError: unknown;
  const error = new Error("save failed");
  render(
    <Form.Provider
      value={scope({
        form: {
          ...baseForm,
          handleSubmit: async () => {
            submits += 1;
            throw error;
          },
        },
        onChange: () => {
          changes += 1;
        },
        onSubmitError: (value: unknown) => {
          receivedError = value;
        },
      })}
    >
      <Form.Shell>
        <button type="submit">Submit</button>
      </Form.Shell>
    </Form.Provider>,
  );
  await userEvent.setup().click(screen.getByRole("button", { name: "Submit" }));
  assert.deepEqual([submits, changes, receivedError], [1, 1, error]);
});

test("Form.Feedback renders errors and follow-up status", () => {
  render(
    <Form.Provider
      value={scope({ error: "request failed", result: { outcome: "saved-with-follow-up-errors" } })}
    >
      <Form.Feedback />
    </Form.Provider>,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("request failed");
  expect(screen.getByRole("status")).toHaveTextContent("Saved, but a follow-up action failed.");
});

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
  assert.deepEqual([restored, discarded], [1, 1]);
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
