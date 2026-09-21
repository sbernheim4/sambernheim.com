import assert from "node:assert/strict";
import { act, render, waitFor } from "@testing-library/react";
import { test } from "vitest";
import type { ReactNode } from "react";
import { useComposableForm } from "../src/forms/hooks/useComposableForm";
import {
  usePersistedFormData,
  type PersistedFormBinding,
  type PersistedDraftController,
} from "../src/forms/hooks/usePersistedFormData";

test("query updates received while dirty are applied after discard", async () => {
  let currentForm: any;

  const Harness = ({ data }: { data: { value: string } }) => {
    currentForm = useComposableForm({
      id: "resource",
      defaultValues: { value: "initial" },
      query: {
        data,
        isPending: false,
        isError: false,
      },
      endpoint: {
        mutationFn: async (values: { value: string }) => {
          return values;
        },
      },
    });

    return null;
  };

  const renderer = render(<Harness data={{ value: "server-1" }} />);

  await act(async () => {
    currentForm!.form.setFieldValue("value", "local");
  });

  renderer.rerender(<Harness data={{ value: "server-2" }} />);

  assert.equal(currentForm!.form.state.values.value, "local");

  await act(async () => {
    currentForm!.form.reset();
  });

  assert.equal(currentForm!.form.state.values.value, "server-2");
});

test("draft persistence stores and restores only dirty forms", async () => {
  window.localStorage.clear();
  const dirtyValues = { name: "edited" };
  const cleanValues = { name: "current" };
  let dirty = true;
  let controller: PersistedDraftController | undefined;
  let restoredDirtyValues: Record<string, unknown> | undefined;
  let cleanResetCount = 0;

  const dirtyBinding: PersistedFormBinding = {
    id: "dirty",
    form: {
      state: { values: dirtyValues, isDirty: dirty },
      store: {
        subscribe: () => {
          return { unsubscribe: () => {} };
        },
      },
      reset: () => {},
      setFieldValue: (field, value) => {
        restoredDirtyValues = {
          ...restoredDirtyValues,
          [field]: value,
        };
      },
    },
  };
  const cleanBinding: PersistedFormBinding = {
    id: "clean",
    form: {
      state: { values: cleanValues, isDirty: false },
      store: {
        subscribe: () => {
          return { unsubscribe: () => {} };
        },
      },
      reset: () => {
        cleanResetCount += 1;
      },
      setFieldValue: () => {},
    },
  };

  const Harness = ({ children }: { children?: ReactNode }) => {
    controller = usePersistedFormData({
      storageKey: "forms",
      forms: [dirtyBinding, cleanBinding],
    });

    return children ?? null;
  };

  render(<Harness />);

  await waitFor(() => {
    assert.ok(window.localStorage.getItem("forms"));
  });

  const stored = JSON.parse(window.localStorage.getItem("forms")!);
  assert.deepEqual(stored.dirtyFormIds, ["dirty"]);
  assert.deepEqual(stored.values, { dirty: dirtyValues });

  act(() => {
    controller!.restore();
  });

  assert.deepEqual(restoredDirtyValues, dirtyValues);
  assert.equal(cleanResetCount, 0);
});

test("version-one drafts are ignored", async () => {
  window.localStorage.setItem(
    "forms",
    JSON.stringify({
      version: 1,
      savedAt: new Date().toISOString(),
      values: { dirty: { name: "legacy" } },
    }),
  );

  let controller: PersistedDraftController | undefined;
  const Harness = () => {
    controller = usePersistedFormData({ storageKey: "forms", forms: [] });
    return null;
  };

  render(<Harness />);

  assert.equal(controller!.hasDraft, false);
});
