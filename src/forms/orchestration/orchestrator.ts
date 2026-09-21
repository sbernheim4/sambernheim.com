import type { QueryClient } from "@tanstack/react-query";
import type { AnyForm, SaveConfig, SaveResult } from "./types";
import { compileSavePlan } from "./plan";
import { createSavePipeline, type PipelineOperations, type SaveState } from "./pipeline";
import { captureUndoState, snapshotForms } from "./snapshot";
import { prepareIndependentPayloads, validateForms } from "./validation";
import { saveFormsInGraph } from "./scheduler";
import {
  invokeConfigCallbacks,
  invokeFormCallbacks,
  invokeFormFinish,
  markFormsSaved,
  reconcileCacheWithMutationResponses,
  refreshAndInvalidateCache,
} from "./effects";
import { updateSkippedFormsState } from "./state";
import { emitProgress } from "./progress";
import { waitForProgress } from "./mutation";

export type { SaveState } from "./progress";

export const createOrchestrator = <P extends readonly AnyForm[]>(
  queryClient: QueryClient,
  onChange: (state: SaveState<P>) => void = () => {},
) => {
  let active: Promise<SaveResult<P>> | undefined;
  const executePipeline = createSavePipeline(createPipelineOperations<P>(), queryClient, onChange);

  const submit = (config: SaveConfig<P>): Promise<SaveResult<P>> => {
    if (active) {
      return active;
    }

    const { plan, errors } = compileSavePlan(config.forms);
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

const createPipelineOperations = <P extends readonly AnyForm[]>(): PipelineOperations<P> => {
  return {
    captureUndoState,
    snapshotForms,
    validateForms,
    prepareIndependentPayloads,
    saveFormsInGraph,
    updateSkippedFormsState,
    refreshAndInvalidateCache,
    reconcileCacheWithMutationResponses,
    markFormsSaved,
    invokeFormCallbacks,
    invokeConfigCallbacks,
    invokeFormFinish,
    getOutcome: (hasSomeFailure, allSaved) => {
      return hasSomeFailure ? "validation-failed" : allSaved ? "success" : "partial-failure";
    },
    waitForProgress,
    emitProgress,
  };
};
