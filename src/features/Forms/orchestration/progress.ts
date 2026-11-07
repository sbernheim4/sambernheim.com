import type { AnyForm, Phase, SaveResult } from "./types";
import type { FormStates, Responses } from "./state";

export type SaveState<P extends readonly AnyForm[]> = {
  correlationId: string;
  /** Unix epoch milliseconds when this progress snapshot was emitted. */
  timestamp: number;
  phase: Phase;
  isSaving: boolean;
  result?: SaveResult<P>;
};

export const createCorrelationId = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

export const emitProgress = <P extends readonly AnyForm[]>(
  onChange: (state: SaveState<P>) => void,
  correlationId: string,
  phase: Phase,
  result: SaveResult<P>,
  states: FormStates,
  responses: Responses,
) => {
  onChange({
    correlationId,
    timestamp: Date.now(),
    phase,
    isSaving: phase !== "complete",
    result: {
      ...result,
      forms: Object.fromEntries(
        Object.entries(states).map(([id, state]) => {
          return [id, { ...state }];
        }),
      ) as SaveResult<P>["forms"],
      responses: { ...responses } as SaveResult<P>["responses"],
      followUpErrors: [...result.followUpErrors],
    },
  });
};
