import assert from "node:assert/strict";
import { test } from "node:test";
import { act, create } from "react-test-renderer";
import type { ReactNode } from "react";
import { useComposableForm } from "../src/forms/hooks/useComposableForm";
import {
  usePersistedFormData,
  type PersistedFormBinding,
  type PersistedDraftController,
} from "../src/forms/hooks/usePersistedFormData";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const waitForEffects = async () => {
  await act(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 250);
    });
  });
};

const installLocalStorage = () => {
  const values = new Map<string, string>();

  const localStorage = {
    getItem: (key: string) => {
      return values.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage },
  });

  return { localStorage, values };
};

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

  let renderer: ReturnType<typeof create>;

  await act(async () => {
    renderer = create(<Harness data={{ value: "server-1" }} />);
  });

  await act(async () => {
    currentForm!.form.setFieldValue("value", "local");
  });

  await act(async () => {
    renderer.update(<Harness data={{ value: "server-2" }} />);
  });

  assert.equal(currentForm!.form.state.values.value, "local");

  await act(async () => {
    currentForm!.form.reset();
  });

  assert.equal(currentForm!.form.state.values.value, "server-2");

  await act(async () => {
    renderer!.unmount();
  });
});

test("draft persistence stores and restores only dirty forms", async () => {
  const { localStorage } = installLocalStorage();
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

  let renderer: ReturnType<typeof create>;

  await act(async () => {
    renderer = create(<Harness />);
  });

  await waitForEffects();

  const stored = JSON.parse(localStorage.getItem("forms")!);
  assert.deepEqual(stored.dirtyFormIds, ["dirty"]);
  assert.deepEqual(stored.values, { dirty: dirtyValues });

  await act(async () => {
    controller!.restore();
  });

  assert.deepEqual(restoredDirtyValues, dirtyValues);
  assert.equal(cleanResetCount, 0);

  await act(async () => {
    renderer!.unmount();
  });
});

test("version-one drafts are ignored", async () => {
  const { localStorage } = installLocalStorage();
  localStorage.setItem(
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

  let renderer: ReturnType<typeof create>;

  await act(async () => {
    renderer = create(<Harness />);
  });

  assert.equal(controller!.hasDraft, false);

  await act(async () => {
    renderer!.unmount();
  });
});
