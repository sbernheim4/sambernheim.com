import { useCallback, useEffect, useRef, useState } from "react";

export type PersistedFormBinding = {
  id: string;
  form: {
    state: { values: unknown; isDirty: boolean };
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

type PersistedDraft = {
  version: 1;
  savedAt: string;
  values: Record<string, unknown>;
};

const readDraft = (storageKey: string): PersistedDraft | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<PersistedDraft>;
    if (parsed.version !== 1 || !parsed.savedAt || !parsed.values) return undefined;
    return { version: 1, savedAt: parsed.savedAt, values: parsed.values };
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

  const clear = useCallback(() => {
    if (storageKey) removeDraft(storageKey);
    setHasDraft(false);
    setSavedAt(undefined);
    setDismissed(false);
  }, [storageKey]);

  const persist = useCallback(() => {
    if (!storageKey || typeof window === "undefined") return;
    if (!forms.some((binding) => binding.form.state.isDirty)) {
      return;
    }

    const draft: PersistedDraft = {
      version: 1,
      savedAt: new Date().toISOString(),
      values: Object.fromEntries(forms.map((binding) => [binding.id, binding.form.state.values])),
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
    if (!storageKey) return;

    const schedulePersist = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(persist, 200);
    };
    const subscriptions = forms.map((binding) => binding.form.store.subscribe(schedulePersist));
    schedulePersist();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [forms, persist, storageKey]);

  const restore = useCallback(() => {
    if (!storageKey) return false;
    const draft = readDraft(storageKey);
    if (!draft) return false;

    for (const binding of forms) {
      const values = draft.values[binding.id];
      if (values === undefined) continue;
      binding.form.reset();
      if (binding.form.setFieldValue && values && typeof values === "object") {
        for (const [field, value] of Object.entries(values)) {
          binding.form.setFieldValue(field, value);
        }
      }
    }

    setDismissed(true);
    return true;
  }, [forms, storageKey]);

  const discard = useCallback(() => {
    for (const binding of forms) binding.form.reset();
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
