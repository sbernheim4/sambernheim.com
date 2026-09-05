import { useEffect, useRef, useState, type RefObject } from "react";
import { evaluate, type AnyFormApi } from "@tanstack/form-core";
import type {
  AnyForm,
  AsyncMutation,
  OutcomeCallbacks,
  Endpoint,
  RetryPolicy,
  Response,
  Input,
  PayloadMapping,
  ResponsesOf,
} from "../orchestration/types";
import { useAppForm } from "./useAppForm";
import { acceptSavedBaseline, validateSnapshot } from "./formState";

export type QuerySource<QueryData> = {
  data: QueryData | undefined;
  isPending: boolean;
  isError: boolean;
  error?: unknown;
};
export type FormSource<QueryData, Values> = { defaultValues: Values } & (
  | { query?: QuerySource<NoInfer<Values>>; toFormData?: never }
  | {
      query?: QuerySource<QueryData>;
      toFormData: (data: QueryData) => NoInfer<Values>;
    }
);
type Baseline<Values> = { values: Values; initialized: boolean };
type FormValidator<Values> = (values: Values) => string | undefined | Promise<string | undefined>;

/** Resolve query data or create defaults without changing the live form. */
function readFormSource<QueryData, Values>(
  source: FormSource<QueryData, Values>,
): {
  baseline: Baseline<Values>;
  error?: unknown;
} {
  const { query, defaultValues, toFormData } = source;

  const baseline = {
    values: defaultValues,
    initialized: !query,
  };

  if (!query || query.data === undefined || query.isError) {
    return {
      baseline,
    };
  }

  try {
    return {
      baseline: {
        values: toFormData ? toFormData(query.data) : query.data,
        initialized: true,
      },
    };
  } catch (error) {
    return { baseline, error };
  }
}

function canAcceptQueryValues<Values>(baseline: Baseline<Values>, values: Values, saving: boolean) {
  return !saving && (!baseline.initialized || evaluate(values, baseline.values));
}

async function validateFormValues<Values>(
  form: AnyFormApi,
  values: Values,
  validate?: FormValidator<NoInfer<Values>>,
) {
  const fields = await validateSnapshot(form, values);
  const error = await validate?.(values);

  if (!error) {
    return fields;
  }

  if (evaluate(form.state.values, values)) {
    form.setErrorMap({
      onSubmit: { form: error, fields: {} },
    });
  }

  return {
    valid: false as const,
    error: new Error(error),
  };
}

function isFormReady(
  baseline: { initialized: boolean },
  readError: unknown,
  query?: QuerySource<unknown>,
) {
  return (
    baseline.initialized &&
    !readError &&
    (!query || (!query.isPending && !query.isError && query.data !== undefined))
  );
}

// Update the values for the form if the backing data changes.
// The backing data can change if someone else made an update
// which is manifested via a refetch function invocation/cache invalidation of
// the associated entity query hook.
function useQueryFormSync<QueryData, Values>({
  source,
  form,
  baseline,
  inFlight,
  initialError,
}: {
  source: FormSource<QueryData, Values>;
  form: AnyFormApi;
  baseline: RefObject<Baseline<Values>>;
  inFlight: RefObject<boolean>;
  initialError: unknown;
}) {
  const [readError, setReadError] = useState(initialError);
  const [, render] = useState(0);
  const lastData = useRef(baseline.current.initialized ? source.query?.data : undefined);

  useEffect(() => {
    if (
      !source.query ||
      source.query.data === undefined ||
      source.query.isError ||
      lastData.current === source.query.data
    ) {
      return;
    }

    lastData.current = source.query.data;

    if (!canAcceptQueryValues(baseline.current, form.state.values, inFlight.current)) {
      return;
    }

    const next = readFormSource(source);
    setReadError(next.error);
    if (!next.baseline.initialized) {
      return;
    }

    baseline.current = next.baseline;
    form.reset(next.baseline.values);
    render((n) => n + 1);
  }, [source.query?.data, source.query?.isError, source.toFormData, form, baseline, inFlight]);

  return readError;
}

export type FormOptions<
  QueryData,
  Values,
  Mutation extends AsyncMutation,
  Dependencies extends readonly AnyForm[] = readonly [],
> = OutcomeCallbacks<
  NoInfer<Values>,
  Input<NoInfer<Mutation>>,
  Response<NoInfer<Mutation>>,
  Partial<ResponsesOf<Dependencies>>
> &
  PayloadMapping<NoInfer<Values>, Input<NoInfer<Mutation>>, Partial<ResponsesOf<Dependencies>>> &
  FormSource<QueryData, Values> & {
    dependencies?: Dependencies;
    endpoint: Endpoint<Mutation, Partial<ResponsesOf<Dependencies>>>;
    retry?: RetryPolicy;
    /** Validation of the submitted values, alongside registered field validators. */
    validate?: FormValidator<NoInfer<Values>>;
  };

export type ComposableFormConfig<
  Id extends string,
  QueryData,
  Values,
  Mutation extends AsyncMutation,
  Dependencies extends readonly AnyForm[] = readonly [],
> = FormOptions<QueryData, Values, Mutation, Dependencies> & { id: Id };

export function useComposableForm<
  const Id extends string,
  QueryData,
  Values,
  Mutation extends AsyncMutation,
  const Dependencies extends readonly AnyForm[] = readonly [],
>(config: ComposableFormConfig<Id, QueryData, Values, Mutation, Dependencies>) {
  const [initial] = useState(() => readFormSource(config));
  const baseline = useRef(initial.baseline);
  const inFlight = useRef(false);
  const form = useAppForm({
    defaultValues: baseline.current.values,
  });

  const readError = useQueryFormSync({
    source: config,
    form,
    baseline,
    inFlight,
    initialError: initial.error,
  });

  const isReady = isFormReady(baseline.current, readError, config.query);

  const saveConfig = {
    ...config,
    // Called for every form after the complete save, including skipped forms.
    finish: () => {
      inFlight.current = false;
    },
    snapshot: () => {
      if (!isReady) {
        throw readError ?? config.query?.error ?? new Error("Form data is not ready.");
      }
      inFlight.current = true;
      return form.state.values;
    },
    validate: (values: Values) => validateFormValues(form, values, config.validate),
    acceptBaseline: (values: Values) => {
      baseline.current = { values, initialized: true };
      acceptSavedBaseline(form, values);
    },
  };

  return {
    form,
    ...saveConfig,
    isReady,
    readError: readError ?? config.query?.error,
  };
}
