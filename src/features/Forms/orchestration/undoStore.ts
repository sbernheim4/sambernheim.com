import { useSyncExternalStore } from "react";

export type FormUndoTransaction = {
  id: string;
  expiresAt: number;
  formIds: readonly string[];
  undo: () => Promise<void>;
};

let transaction: FormUndoTransaction | undefined;
let expirationTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

const clearExpirationTimer = () => {
  if (expirationTimer) {
    clearTimeout(expirationTimer);
    expirationTimer = undefined;
  }
};

export const setFormUndoTransaction = (next: FormUndoTransaction) => {
  clearExpirationTimer();
  transaction = next;
  expirationTimer = setTimeout(
    () => {
      transaction = undefined;
      expirationTimer = undefined;
      notify();
    },
    Math.max(0, next.expiresAt - Date.now()),
  );
  notify();
};

export const clearFormUndoTransaction = () => {
  clearExpirationTimer();
  transaction = undefined;
  notify();
};

export const useFormUndoTransaction = () => {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    () => {
      return transaction;
    },
    () => {
      return undefined;
    },
  );
};
