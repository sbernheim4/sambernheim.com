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
import { markFormSaved, resetFormValues, validateSnapshot } from "./formState";

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
type FormValidator<Values> = (values: Values) => string | undefined | Promise<string | undefined>;

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
  initialized: boolean,
  readError: unknown,
  query?: QuerySource<unknown>,
) {
  return (
    initialized &&
    !readError &&
    (!query || (!query.isPending && !query.isError && query.data !== undefined))
  );
}

// Sync backing query updates (including polling) while the form is clean.
// TanStack owns the saved defaults and dirty state; no separate values are stored.
function useQueryFormSync<QueryData, Values>({
  source,
  form,
  inFlight,
}: {
  source: FormSource<QueryData, Values>;
  form: AnyFormApi;
  inFlight: RefObject<boolean>;
}) {
  const [queryState, setQueryState] = useState({
    initialized: !source.query,
    readError: undefined as unknown,
  });
  const lastData = useRef<unknown>(undefined);

  useEffect(() => {
    const { query, toFormData } = source;
    if (!query || query.data === undefined || query.isError || lastData.current === query.data) {
      return;
    }

    lastData.current = query.data;
    if (inFlight.current || form.state.isDirty) {
      return;
    }

    try {
      const values = toFormData ? toFormData(query.data) : query.data;
      resetFormValues(form, values);
      setQueryState({ initialized: true, readError: undefined });
    } catch (error) {
      setQueryState((state) => ({ ...state, readError: error }));
    }
  }, [source.query?.data, source.query?.isError, source.toFormData, form, inFlight]);

  return queryState;
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
  const inFlight = useRef(false);
  // Reuse TanStack's current defaults when React updates the form options.
  // This is a reference to the form, not another copy of its values.
  const formRef = useRef<{ options: { defaultValues?: Values } } | null>(null);
  const form = useAppForm({
    defaultValues: formRef.current?.options.defaultValues ?? config.defaultValues,
  });
  formRef.current = form;

  const { initialized, readError } = useQueryFormSync({
    source: config,
    form,
    inFlight,
  });
  const isReady = isFormReady(initialized, readError, config.query);

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
    markSaved: (values: Values) => markFormSaved(form, values),
  };

  return {
    form,
    ...saveConfig,
    isReady,
    readError: readError ?? config.query?.error,
  };
}
