import type { QueryClient } from "@tanstack/react-query";
import type { AnyForm, SaveConfig, SaveResult } from "./types";
import { compileSavePlan } from "./plan";
import { createSavePipeline, type SaveState } from "./pipeline";

export type { SaveState } from "./progress";

export const createOrchestrator = <P extends readonly AnyForm[]>(
  queryClient: QueryClient,
  onChange: (state: SaveState<P>) => void = () => {},
) => {
  let active: Promise<SaveResult<P>> | undefined;
  const executePipeline = createSavePipeline(queryClient, onChange);

  const submit = (config: SaveConfig<P>): Promise<SaveResult<P>> => {
    if (active) {
      return active;
    }

    const { plan, errors } = compileSavePlan(
      config.forms,
      config.undoPayloads !== undefined ? "undo" : "save",
    );

    if (errors.length) {
      return Promise.reject(
        new AggregateError(
          errors,
          errors
            .map((error) => {
              return error.message;
            })
            .join("; "),
        ),
      );
    }

    if (!plan) {
      return Promise.reject(new AggregateError(errors, "Unable to compile save plan."));
    }

    active = executePipeline(config, plan).finally(() => {
      active = undefined;
    });
    return active;
  };

  const reset = (config: SaveConfig<P>) => {
    if (active) {
      return false;
    }

    onChange({ phase: "idle", isSaving: false });

    for (const form of config.forms) {
      form.form.reset();
    }

    return true;
  };

  return { submit, reset };
};
