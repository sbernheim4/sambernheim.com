import type { FormSaveState, FollowUpError } from "./types";

export type FormState = Readonly<FormSaveState<any, any, any>>;
export type FormStates = Readonly<Record<string, FormState>>;
export type Responses = Readonly<Record<string, any>>;

export type RuntimeState = {
  forms: FormStates;
  responses: Responses;
  followUpErrors: readonly FollowUpError[];
};

export type StateEvent =
  | { type: "form.ready"; id: string; variables?: unknown }
  | { type: "form.saving"; id: string; attempt: number }
  | { type: "form.retrying"; id: string }
  | { type: "form.saved"; id: string; response: unknown }
  | {
      type: "form.failed";
      id: string;
      phase: "validation" | "mapping" | "save";
      error: unknown;
    }
  | { type: "form.skipped"; id: string; blockedBy: readonly string[] }
  | { type: "follow-up.failed"; error: FollowUpError };

export const reduceRuntimeState = (state: RuntimeState, event: StateEvent): RuntimeState => {
  if (event.type === "follow-up.failed") {
    return { ...state, followUpErrors: [...state.followUpErrors, event.error] };
  }

  const current = state.forms[event.id];

  switch (event.type) {
    case "form.ready":
      return {
        ...state,
        forms: {
          ...state.forms,
          [event.id]: { ...current, status: "ready", variables: event.variables },
        },
      };
    case "form.saving":
      return {
        ...state,
        forms: {
          ...state.forms,
          [event.id]: { ...current, status: "saving", attempts: event.attempt },
        },
      };
    case "form.retrying":
      return {
        ...state,
        forms: { ...state.forms, [event.id]: { ...current, status: "retrying" } },
      };
    case "form.saved":
      return {
        ...state,
        forms: {
          ...state.forms,
          [event.id]: { ...current, status: "saved", response: event.response },
        },
        responses: { ...state.responses, [event.id]: event.response },
      };
    case "form.failed":
      return {
        ...state,
        forms: {
          ...state.forms,
          [event.id]: getFailedState(current, event.phase, event.error),
        },
      };
    case "form.skipped":
      return {
        ...state,
        forms: {
          ...state.forms,
          [event.id]: { ...current, status: "skipped", blockedBy: event.blockedBy },
        },
      };
  }
};

export const getFailedState = (
  state: FormState,
  phase: "validation" | "mapping" | "save",
  error: unknown,
): FormState => {
  return {
    ...state,
    status: phase === "validation" ? "invalid" : "failed",
    failure: {
      formId: state.formId,
      phase,
      error,
      formValues: state.formValues,
      variables: state.variables,
      attempts: state.attempts,
    },
  };
};

export const updateSkippedFormsState = (states: FormStates): FormStates => {
  return Object.fromEntries(
    Object.entries(states).map(([id, state]) => {
      return [id, state.status === "ready" ? { ...state, status: "skipped" } : state];
    }),
  );
};
