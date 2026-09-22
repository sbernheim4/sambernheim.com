import type { AnyForm, Phase, SaveResult } from "./types";
import type { FormStates, Responses } from "./state";

export type SaveState<P extends readonly AnyForm[]> = {
  /** Unix epoch milliseconds when this progress snapshot was emitted. */
  timestamp: number;
  phase: Phase;
  isSaving: boolean;
  result?: SaveResult<P>;
};

export const emitProgress = <P extends readonly AnyForm[]>(
  onChange: (state: SaveState<P>) => void,
  phase: Phase,
  result: SaveResult<P>,
  states: FormStates,
  responses: Responses,
) => {
  onChange({
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
