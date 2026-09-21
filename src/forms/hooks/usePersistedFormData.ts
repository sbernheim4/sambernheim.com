import { useCallback, useEffect, useRef, useState } from "react";

export type PersistedFormBinding = {
  id: string;
  form: {
    state: { values: Record<string, unknown>; isDirty: boolean };
    store: { subscribe: (listener: () => void) => { unsubscribe: () => void } };
    reset: (...args: any[]) => void;
    setFieldValue?: (field: any, value: any) => void;
  };
};

export type PersistedDraftController = {
  hasDraft: boolean;
  savedAt?: string;
  restore: () => boolean;
  discard: () => void;
  clear: () => void;
};

export type PersistedDraft = {
  version: 2;
  savedAt: string;
  values: Record<string, unknown>;
  dirtyFormIds: string[];
};

const readDraft = (storageKey: string): PersistedDraft | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as Partial<PersistedDraft>;
    if (
      parsed.version !== 2 ||
      typeof parsed.savedAt !== "string" ||
      !parsed.values ||
      typeof parsed.values !== "object" ||
      !Array.isArray(parsed.dirtyFormIds) ||
      !parsed.dirtyFormIds.every((id): id is string => {
        return typeof id === "string";
      })
    ) {
      return undefined;
    }
    return {
      version: 2,
      savedAt: parsed.savedAt,
      values: parsed.values,
      dirtyFormIds: parsed.dirtyFormIds,
    };
  } catch {
    return undefined;
  }
};

const removeDraft = (storageKey: string) => {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Storage can be unavailable or quota-restricted.
  }
};

const flattenValues = (value: unknown, path = ""): [string, unknown][] => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return path ? [[path, value]] : [];
  }

  return Object.entries(value).flatMap(([key, child]) => {
    return flattenValues(child, path ? `${path}.${key}` : key);
  });
};

export const usePersistedFormData = ({
  storageKey,
  forms,
}: {
  storageKey?: string;
  forms: readonly PersistedFormBinding[];
}): PersistedDraftController => {
  const initial = storageKey ? readDraft(storageKey) : undefined;
  const [hasDraft, setHasDraft] = useState(initial !== undefined);
  const [savedAt, setSavedAt] = useState(initial?.savedAt);
  const [dismissed, setDismissed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const didMount = useRef(false);
  const skipPersist = useRef(false);

  useEffect(() => {
    const draft = storageKey ? readDraft(storageKey) : undefined;
    if (!didMount.current) {
      didMount.current = true;
      skipPersist.current = draft !== undefined;
    } else {
      skipPersist.current = true;
    }
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
    setHasDraft(draft !== undefined);
    setSavedAt(draft?.savedAt);
    setDismissed(false);
  }, [storageKey]);

  const clear = useCallback(() => {
    if (storageKey) {
      removeDraft(storageKey);
    }
    setHasDraft(false);
    setSavedAt(undefined);
    setDismissed(false);
  }, [storageKey]);

  const persist = useCallback(() => {
    if (!storageKey || typeof window === "undefined") {
      return;
    }
    const dirtyForms = forms.filter((binding) => {
      return binding.form.state.isDirty;
    });
    if (!dirtyForms.length) {
      return;
    }

    const draft: PersistedDraft = {
      version: 2,
      savedAt: new Date().toISOString(),
      values: Object.fromEntries(
        dirtyForms.map((binding) => {
          return [binding.id, binding.form.state.values];
        }),
      ),
      dirtyFormIds: dirtyForms.map((binding) => {
        return binding.id;
      }),
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
      setHasDraft(true);
      setSavedAt(draft.savedAt);
    } catch {
      // Storage can be unavailable or quota-restricted.
    }
  }, [forms, storageKey]);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    const schedulePersist = () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(persist, 200);
    };
    const subscriptions = forms.map((binding) => {
      return binding.form.store.subscribe(schedulePersist);
    });
    if (skipPersist.current) {
      skipPersist.current = false;
    } else {
      schedulePersist();
    }
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      subscriptions.forEach((subscription) => {
        return subscription.unsubscribe();
      });
    };
  }, [forms, persist, storageKey]);

  const restore = useCallback(() => {
    if (!storageKey) {
      return false;
    }
    const draft = readDraft(storageKey);
    if (!draft) {
      return false;
    }

    for (const binding of forms) {
      if (!draft.dirtyFormIds.includes(binding.id)) {
        continue;
      }
      const values = draft.values[binding.id];
      if (values === undefined) {
        continue;
      }
      if (!values || typeof values !== "object" || Array.isArray(values)) {
        return false;
      }
    }

    for (const binding of forms) {
      if (!draft.dirtyFormIds.includes(binding.id)) {
        continue;
      }
      const values = draft.values[binding.id];
      if (values === undefined) {
        continue;
      }
      binding.form.reset();
      if (binding.form.setFieldValue) {
        for (const [field, value] of flattenValues(values)) {
          binding.form.setFieldValue(field, value);
        }
      }
    }

    setDismissed(true);
    return true;
  }, [forms, storageKey]);

  const discard = useCallback(() => {
    for (const binding of forms) {
      binding.form.reset();
    }
    clear();
  }, [clear, forms]);

  return {
    hasDraft: hasDraft && !dismissed,
    savedAt,
    restore,
    discard,
    clear,
  };
};
