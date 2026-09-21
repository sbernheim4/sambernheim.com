import assert from "node:assert/strict";
import { act, render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { test } from "vitest";
import type { ReactNode } from "react";
import { useComposableForm } from "../src/forms/hooks/useComposableForm";
import { useFormOrchestrator } from "../src/forms/hooks/useFormOrchestrator";
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

test("draft restoration restores nested field paths", async () => {
  window.localStorage.setItem(
    "nested-forms",
    JSON.stringify({
      version: 2,
      savedAt: new Date().toISOString(),
      values: { profile: { address: { city: "New York" } } },
      dirtyFormIds: ["profile"],
    }),
  );

  const restored: Record<string, unknown> = {};
  let controller: PersistedDraftController | undefined;
  const binding: PersistedFormBinding = {
    id: "profile",
    form: {
      state: { values: {}, isDirty: false },
      store: {
        subscribe: () => {
          return { unsubscribe: () => {} };
        },
      },
      reset: () => {},
      setFieldValue: (field, value) => {
        restored[field] = value;
      },
    },
  };

  const Harness = () => {
    controller = usePersistedFormData({ storageKey: "nested-forms", forms: [binding] });
    return null;
  };

  render(<Harness />);
  act(() => {
    controller!.restore();
  });

  assert.deepEqual(restored, { "address.city": "New York" });
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

test("a no-op submit closes progress immediately", async () => {
  let orchestrator: ReturnType<typeof useFormOrchestrator> | undefined;
  const form = {
    id: "clean",
    form: {
      state: { isDirty: false },
      store: {
        subscribe: () => {
          return { unsubscribe: () => {} };
        },
      },
      reset: () => {},
    },
    snapshot: () => {
      return {};
    },
    validate: () => {
      return { valid: true as const };
    },
    endpoint: {
      mutationFn: async () => {
        return {};
      },
    },
  };

  const Harness = () => {
    orchestrator = useFormOrchestrator({
      forms: [form],
      progressDelayMs: 100,
    });
    return null;
  };

  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>,
  );

  await act(async () => {
    await orchestrator!.submit();
  });

  assert.equal(orchestrator!.orchestratorProgress.isOpen, false);
});
