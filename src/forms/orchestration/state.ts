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
  | { type: "snapshot.initialized"; forms: FormStates }
  | { type: "validation.succeeded"; id: string }
  | { type: "validation.failed"; id: string; error: unknown }
  | { type: "payload.prepared"; id: string; variables: unknown }
  | { type: "saving.started"; id: string; attempt: number }
  | { type: "saving.retrying"; id: string }
  | { type: "saved"; id: string; response: unknown }
  | { type: "failed"; id: string; phase: "validation" | "mapping" | "save"; error: unknown }
  | { type: "skipped"; id: string; blockedBy: readonly string[] }
  | { type: "follow-up.failed"; error: FollowUpError };

const requireStatus = (
  id: string,
  event: StateEvent,
  state: FormState,
  allowed: readonly FormState["status"][],
) => {
  if (!allowed.includes(state.status)) {
    throw new Error(`Invalid runtime transition for ${id}: ${state.status} -> ${event.type}.`);
  }
};

export const reduceRuntimeState = (state: RuntimeState, event: StateEvent): RuntimeState => {
  if (event.type === "snapshot.initialized") {
    if (Object.keys(state.forms).length) {
      throw new Error("Runtime snapshot can only be initialized once.");
    }
    return { ...state, forms: event.forms };
  }
  if (event.type === "follow-up.failed") {
    return { ...state, followUpErrors: [...state.followUpErrors, event.error] };
  }
  const current = state.forms[event.id];
  if (!current) {
    throw new Error(`Unknown form ID in runtime event: ${event.id}`);
  }
  switch (event.type) {
    case "validation.succeeded":
      requireStatus(event.id, event, current, ["validating"]);
      return { ...state, forms: { ...state.forms, [event.id]: { ...current, status: "ready" } } };
    case "validation.failed":
      requireStatus(event.id, event, current, ["validating"]);
      return {
        ...state,
        forms: { ...state.forms, [event.id]: getFailedState(current, "validation", event.error) },
      };
    case "payload.prepared":
      requireStatus(event.id, event, current, ["ready"]);
      return {
        ...state,
        forms: { ...state.forms, [event.id]: { ...current, variables: event.variables } },
      };
    case "saving.started":
      requireStatus(event.id, event, current, ["ready", "retrying"]);
      return {
        ...state,
        forms: {
          ...state.forms,
          [event.id]: { ...current, status: "saving", attempts: event.attempt },
        },
      };
    case "saving.retrying":
      requireStatus(event.id, event, current, ["saving"]);
      return {
        ...state,
        forms: { ...state.forms, [event.id]: { ...current, status: "retrying" } },
      };
    case "saved":
      requireStatus(event.id, event, current, ["saving"]);
      return {
        ...state,
        forms: {
          ...state.forms,
          [event.id]: { ...current, status: "saved", response: event.response },
        },
        responses: { ...state.responses, [event.id]: event.response },
      };
    case "failed":
      requireStatus(event.id, event, current, ["ready", "saving", "retrying"]);
      return {
        ...state,
        forms: { ...state.forms, [event.id]: getFailedState(current, event.phase, event.error) },
      };
    case "skipped":
      requireStatus(event.id, event, current, ["ready"]);
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
