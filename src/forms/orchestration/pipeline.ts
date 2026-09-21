import type { QueryClient } from "@tanstack/react-query";
import type {
  AnyForm,
  CacheContext,
  FormInput,
  FormSaveState,
  FollowUpError,
  Phase,
  SaveConfig,
  SaveResult,
} from "./types";
import type { SavePlan } from "./plan";
import { reduceRuntimeState, type RuntimeState } from "./state";
import { captureUndoState, snapshotForms } from "./snapshot";
import { prepareIndependentPayloads, validateForms } from "./validation";
import { saveFormsInGraph } from "./formScheduler";
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

export type FormState = Readonly<FormSaveState<any, any, any>>;
export type FormStates = Readonly<Record<string, FormState>>;
export type Responses = Readonly<Record<string, any>>;

export type SaveState<P extends readonly AnyForm[]> = {
  phase: Phase;
  isSaving: boolean;
  result?: SaveResult<P>;
};

type RunContext<P extends readonly AnyForm[]> = {
  forms: readonly FormInput[];
  config: SaveConfig<P>;
  plan: SavePlan;
  queryClient: QueryClient;
  states: FormStates;
  responses: Responses;
  runtime: RuntimeState;
  result: SaveResult<P>;
  successful: readonly FormInput[];
  allSaved: boolean;
  finished: boolean;
  emit: (phase: Phase) => void;
};

type FormContext = CacheContext<any, any, any> & {
  formId: string;
  formValues: any;
  attempts: number;
  followUpErrors: FollowUpError[];
};

export type PipelineOperations<P extends readonly AnyForm[]> = {
  captureUndoState: (forms: readonly FormInput[]) =>
    | {
        formValues: Record<string, unknown>;
        payloads: Record<string, unknown>;
      }
    | undefined;
  snapshotForms: (
    forms: readonly FormInput[],
    overrides?: Readonly<Record<string, unknown>>,
  ) => FormStates;
  validateForms: (forms: readonly FormInput[], states: FormStates) => Promise<FormStates>;
  prepareIndependentPayloads: (
    forms: readonly FormInput[],
    states: FormStates,
    overrides?: Readonly<Record<string, unknown>>,
  ) => FormStates;
  saveFormsInGraph: (
    plan: SavePlan,
    states: FormStates,
    responses: Responses,
    config: SaveConfig<P>,
    emit: (phase: Phase, states: FormStates, responses: Responses) => void,
  ) => Promise<{ states: FormStates; responses: Responses }>;
  updateSkippedFormsState: (states: FormStates) => FormStates;
  refreshAndInvalidateCache: (
    successful: readonly FormInput[],
    config: SaveConfig<P>,
    queryClient: QueryClient,
  ) => Promise<FollowUpError[]>;
  reconcileCacheWithMutationResponses: (
    successful: readonly FormInput[],
    context: (form: FormInput) => FormContext,
    result: SaveResult<P>,
    queryClient: QueryClient,
    config: SaveConfig<P>,
  ) => FollowUpError[];
  markFormsSaved: (forms: readonly FormInput[], states: FormStates) => Promise<FollowUpError[]>;
  invokeFormCallbacks: (
    forms: readonly FormInput[],
    states: FormStates,
    context: (form: FormInput) => FormContext,
  ) => Promise<FollowUpError[]>;
  invokeConfigCallbacks: (
    allSaved: boolean,
    config: SaveConfig<P>,
    result: SaveResult<P>,
  ) => Promise<FollowUpError[]>;
  invokeFormFinish: (forms: readonly FormInput[]) => Promise<FollowUpError[]>;
  getOutcome: (hasSomeFailure: boolean, allSaved: boolean) => SaveResult<P>["outcome"];
  waitForProgress: (delayMs: number) => Promise<void>;
  emitProgress: (
    onChange: (state: SaveState<P>) => void,
    phase: Phase,
    result: SaveResult<P>,
    states: FormStates,
    responses: Responses,
  ) => void;
};

type Stage<P extends readonly AnyForm[]> = {
  name: string;
  run: (context: RunContext<P>, operations: PipelineOperations<P>) => Promise<void>;
};

export const createSavePipeline = <P extends readonly AnyForm[]>(
  queryClient: QueryClient,
  onChange: (state: SaveState<P>) => void,
) => {
  const operations: PipelineOperations<P> = {
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
  const stages: readonly Stage<P>[] = [
    { name: "snapshot", run: snapshotStage },
    { name: "validate", run: validateStage },
    { name: "prepare-payloads", run: preparePayloadStage },
    { name: "save", run: saveStage },
    { name: "finalize", run: finalizeStage },
    { name: "refresh", run: refreshStage },
    { name: "reconcile", run: reconcileStage },
    { name: "mark-saved", run: markSavedStage },
    { name: "effects", run: effectsStage },
    { name: "complete", run: completeStage },
  ];

  return async (config: SaveConfig<P>, plan: SavePlan): Promise<SaveResult<P>> => {
    const context = createRunContext(config, plan, queryClient, onChange, operations);

    try {
      for (const stage of stages) {
        await stage.run(context, operations);
      }
    } catch (error) {
      if (!context.finished) {
        await operations.invokeFormFinish(context.forms);
        context.finished = true;
      }
      throw error;
    }

    return context.result;
  };
};

const createRunContext = <P extends readonly AnyForm[]>(
  config: SaveConfig<P>,
  plan: SavePlan,
  queryClient: QueryClient,
  onChange: (state: SaveState<P>) => void,
  operations: PipelineOperations<P>,
): RunContext<P> => {
  const context = {
    forms: config.forms,
    config,
    plan,
    queryClient,
    states: {},
    responses: {},
    runtime: { forms: {}, responses: {}, followUpErrors: [] },
    result: {
      outcome: "validation-failed",
      forms: {},
      responses: {},
      followUpErrors: [],
    },
    successful: [],
    allSaved: false,
    finished: false,
    emit: (_phase: Phase) => {},
  } as unknown as RunContext<P>;

  context.emit = (phase) => {
    operations.emitProgress(onChange, phase, context.result, context.states, context.responses);
  };

  return context;
};

const setStates = (context: RunContext<any>, states: FormStates) => {
  context.states = states;
  context.runtime = { ...context.runtime, forms: states };
};

const setResponses = (context: RunContext<any>, responses: Responses) => {
  context.responses = responses;
  context.runtime = { ...context.runtime, responses };
};

const recordFollowUpErrors = (context: RunContext<any>, errors: readonly FollowUpError[]) => {
  for (const error of errors) {
    context.runtime = reduceRuntimeState(context.runtime, {
      type: "follow-up.failed",
      error,
    });
  }
  context.result.followUpErrors = [...context.runtime.followUpErrors];
};

const hasValidationFailure = (context: RunContext<any>) => {
  return context.forms.some((form) => {
    return context.states[form.id].failure?.phase === "validation";
  });
};

const snapshotStage = async <P extends readonly AnyForm[]>(
  context: RunContext<P>,
  operations: PipelineOperations<P>,
) => {
  const undoState = context.config.undoPayloads
    ? undefined
    : operations.captureUndoState(context.forms);

  setStates(context, operations.snapshotForms(context.forms, context.config.undoFormValues));
  context.result = {
    outcome: "validation-failed",
    forms: context.states as SaveResult<P>["forms"],
    responses: context.responses as SaveResult<P>["responses"],
    followUpErrors: [...context.runtime.followUpErrors],
    undoFormValues: undoState?.formValues,
    undoPayloads: undoState?.payloads,
  };

  context.emit("validating");
};

const validateStage = async <P extends readonly AnyForm[]>(
  context: RunContext<P>,
  operations: PipelineOperations<P>,
) => {
  setStates(context, await operations.validateForms(context.forms, context.states));
};

const preparePayloadStage = async <P extends readonly AnyForm[]>(
  context: RunContext<P>,
  operations: PipelineOperations<P>,
) => {
  if (!hasValidationFailure(context)) {
    setStates(
      context,
      operations.prepareIndependentPayloads(
        context.forms,
        context.states,
        context.config.undoPayloads,
      ),
    );
  }
};

const saveStage = async <P extends readonly AnyForm[]>(
  context: RunContext<P>,
  operations: PipelineOperations<P>,
) => {
  if (hasValidationFailure(context)) {
    return;
  }

  const saved = await operations.saveFormsInGraph(
    context.plan,
    context.states,
    context.responses,
    context.config,
    (phase, states, responses) => {
      setStates(context, states);
      setResponses(context, responses);
      context.emit(phase);
    },
  );

  setStates(context, saved.states);
  setResponses(context, saved.responses);
};

const finalizeStage = async <P extends readonly AnyForm[]>(
  context: RunContext<P>,
  operations: PipelineOperations<P>,
) => {
  setStates(context, operations.updateSkippedFormsState(context.states));
  context.result.forms = context.states as SaveResult<P>["forms"];
  context.result.responses = context.responses as SaveResult<P>["responses"];
  context.successful = context.forms.filter((form) => {
    return context.states[form.id].status === "saved";
  });
  context.allSaved = context.successful.length === context.forms.length;
  context.result.outcome = operations.getOutcome(hasValidationFailure(context), context.allSaved);
};

const getFormContext = (context: RunContext<any>, form: FormInput): FormContext => {
  return {
    queryClient: context.queryClient,
    response: context.states[form.id].response,
    variables: context.states[form.id].variables,
    results: context.responses,
    formValues: context.states[form.id].formValues,
    formId: form.id,
    attempts: context.states[form.id].attempts,
    followUpErrors: [...context.runtime.followUpErrors],
  };
};

const refreshStage = async <P extends readonly AnyForm[]>(
  context: RunContext<P>,
  operations: PipelineOperations<P>,
) => {
  if (hasValidationFailure(context)) {
    return;
  }

  await operations.waitForProgress(context.config.progressDelayMs ?? 0);
  context.emit("refreshing");
  recordFollowUpErrors(
    context,
    await operations.refreshAndInvalidateCache(
      context.successful,
      context.config,
      context.queryClient,
    ),
  );
};

const reconcileStage = async <P extends readonly AnyForm[]>(
  context: RunContext<P>,
  operations: PipelineOperations<P>,
) => {
  if (hasValidationFailure(context)) {
    return;
  }

  await operations.waitForProgress(context.config.progressDelayMs ?? 0);
  context.emit("reconciling");
  recordFollowUpErrors(
    context,
    operations.reconcileCacheWithMutationResponses(
      context.successful,
      (form) => {
        return getFormContext(context, form);
      },
      context.result,
      context.queryClient,
      context.config,
    ),
  );
};

const markSavedStage = async <P extends readonly AnyForm[]>(
  context: RunContext<P>,
  operations: PipelineOperations<P>,
) => {
  if (!hasValidationFailure(context)) {
    recordFollowUpErrors(
      context,
      await operations.markFormsSaved(context.successful, context.states),
    );
  }
};

const effectsStage = async <P extends readonly AnyForm[]>(
  context: RunContext<P>,
  operations: PipelineOperations<P>,
) => {
  await operations.waitForProgress(context.config.progressDelayMs ?? 0);
  context.emit("effects");

  recordFollowUpErrors(context, [
    ...(await operations.invokeFormCallbacks(context.forms, context.states, (form) => {
      return getFormContext(context, form);
    })),
    ...(await operations.invokeConfigCallbacks(context.allSaved, context.config, context.result)),
    ...(await operations.invokeFormFinish(context.forms)),
  ]);

  if (context.allSaved && context.result.followUpErrors.length) {
    context.result.outcome = "saved-with-follow-up-errors";
  }
};

const completeStage = async <P extends readonly AnyForm[]>(context: RunContext<P>) => {
  context.emit("complete");
};
