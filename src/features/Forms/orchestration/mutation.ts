import type { FormInput, RetryPolicy } from "./types";
import { getFailedState, type FormState } from "./state";

export const isTransientError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }
  if ("status" in error && typeof error.status === "number") {
    return error.status === 408 || error.status === 429 || error.status >= 500;
  }
  return error instanceof TypeError;
};

export const waitForProgress = async (delayMs: number) => {
  if (delayMs > 0) {
    await new Promise((resolve) => {
      return setTimeout(resolve, delayMs);
    });
  }
};

export const resolveRetryPolicy = (form: FormInput, policy?: RetryPolicy) => {
  return {
    maxRetries: 1,
    delayMs: 500,
    shouldRetry: isTransientError,
    ...policy,
    ...form.retry,
  };
};

export const saveFormWithRetry = async (
  form: FormInput,
  initialState: FormState,
  retry: {
    maxRetries: number;
    delayMs: number | ((attempt: number, error: unknown) => number);
    shouldRetry: (error: unknown) => boolean;
  },
  onProgress: (state: FormState) => void,
  progressDelayMs: number,
): Promise<FormState> => {
  let state = initialState;
  while (true) {
    state = { ...state, status: "saving", attempts: state.attempts + 1 };
    onProgress(state);
    try {
      await waitForProgress(progressDelayMs);
      const response = await form.endpoint.mutationFn(structuredClone(state.variables));
      return { ...state, response, status: "saved" };
    } catch (error) {
      let retryable = false;
      let retryError: unknown;
      try {
        retryable =
          !!form.endpoint.retrySafe &&
          state.attempts <= retry.maxRetries &&
          retry.shouldRetry(error);
      } catch (policyError) {
        retryError = policyError;
        retryable = false;
      }
      if (!retryable) {
        return getFailedState(state, "save", retryError ?? error);
      }
      state = { ...state, status: "retrying" };
      onProgress(state);
      try {
        const delay =
          typeof retry.delayMs === "function"
            ? retry.delayMs(state.attempts, error)
            : retry.delayMs;
        await new Promise((resolve) => {
          return setTimeout(resolve, Math.max(0, delay));
        });
      } catch (delayError) {
        return getFailedState(state, "save", delayError);
      }
    }
  }
};
