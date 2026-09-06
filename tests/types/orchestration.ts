import { defineForm } from "../formConfig";
import type { CacheTarget, SaveResult } from "../../src/forms/orchestration/types.ts";
const mutateAsync = async (input: { name: string }, _options?: { onSuccess?: () => void }) => ({
  profile: { name: input.name, id: "1" },
});
const profile = defineForm({
  id: "profile",
  snapshot: () => ({ displayName: "A" }),
  validate: () => ({ valid: true }),
  toMutationPayload: (values) => ({ name: values.displayName }),
  endpoint: {
    mutationFn: mutateAsync,
  },
  cacheUpdates: [
    {
      queryKey: ({ response, variables }) => [response.profile.id, variables.name],
      getData: (response) => response.profile,
    },
    {
      queryKey: () => ["name"],
      getData: (response) => response.profile.name,
    },
    { queryKey: () => ["envelope"] },
  ],
  onSuccess: ({ response, variables, formValues }) => {
    response.profile.name satisfies string;
    variables.name satisfies string;
    formValues.displayName satisfies string;
    // @ts-expect-error unrelated response
    response.operations;
  },
});
defineForm({
  id: "dependent",
  dependencies: [profile],
  snapshot: () => ({ name: "B" }),
  validate: () => ({ valid: true }),
  toMutationPayload: (values, { results }) => ({
    name: results.profile?.profile.name ?? values.name,
  }),
  endpoint: {
    mutationFn: mutateAsync,
  },
  cacheUpdates: [{ queryKey: ({ results }) => [results.profile?.profile.id] }],
});
// @ts-expect-error mapper is required when form and mutation shapes differ
defineForm({
  id: "bad",
  snapshot: () => ({ display: "A" }),
  validate: () => ({ valid: true }),
  endpoint: { mutationFn: mutateAsync },
});
defineForm({
  id: "bad",
  snapshot: () => ({ name: "A" }),
  validate: () => ({ valid: true }),
  endpoint: { mutationFn: mutateAsync },
  // @ts-expect-error endpoint input must not widen to mapper result
  toMutationPayload: () => ({ name: 1 }),
});
defineForm({
  id: "bad",
  snapshot: () => ({ name: "A" }),
  validate: () => ({ valid: true }),
  endpoint: {
    // @ts-expect-error mutate returns void
    mutationFn: (_input: { name: string }) => {},
  },
});
const identity: CacheTarget<{ name: string }, {}> = {
  queryKey: () => ["identity"],
};
// @ts-expect-error unrelated cache data requires selector
const incorrect: CacheTarget<{ name: string }, {}, number> = {
  queryKey: () => ["incorrect"],
};
declare const result: SaveResult<readonly [typeof profile]>;
result.responses.profile?.profile.name satisfies string | undefined;
// @ts-expect-error response keyed by literal form ID
result.responses.operations;
void identity;
void incorrect;

import { useComposableForm } from "../../src/forms/hooks/useComposableForm";
import { useQueryBackedForm } from "../../src/forms/hooks/useQueryBackedForm";
const query = {
  data: { name: "A", nested: { active: true } },
  isPending: false,
  isError: false,
};
const binding = useComposableForm({
  id: "profile",
  defaultValues: { display: "", active: false },
  query,
  toFormData: (data) => ({ display: data.name, active: data.nested.active }),
  toMutationPayload: (v) => ({ name: v.display }),
  endpoint: { mutationFn: mutateAsync },
});
binding.form.state.values.display satisfies string;
binding.form.state.values.active satisfies boolean;
// @ts-expect-error query fields are not form fields
binding.form.state.values.nested;
useQueryBackedForm({
  defaultValues: query.data,
  query,
  endpoint: { mutationFn: mutateAsync },
  onSuccess: ({ response }) => {
    response.profile.name satisfies string;
  },
});
useComposableForm({
  id: "bad",
  defaultValues: { display: "" },
  query,
  toFormData: (data) => ({ display: data.name }),
  // @ts-expect-error incorrect mutation payload type
  toMutationPayload: () => ({ name: 12 }),
  endpoint: { mutationFn: mutateAsync },
});
// @ts-expect-error renamed form requires a payload mapper
useComposableForm({
  id: "bad",
  defaultValues: { display: "" },
  query,
  toFormData: (data) => ({ display: data.name }),
  endpoint: { mutationFn: mutateAsync },
});

// The single signatures infer defaults, mappings, responses, and dependencies.
const standalone = useQueryBackedForm({
  defaultValues: { display: "" },
  query,
  toFormData: (data) => ({ display: data.name }),
  toMutationPayload: (values) => ({ name: values.display }),
  endpoint: { mutationFn: mutateAsync },
  onSuccess: ({ response, variables, formValues }) => {
    response.profile.id satisfies string;
    variables.name satisfies string;
    formValues.display satisfies string;
    // @ts-expect-error callbacks must retain the actual response shape
    response.task;
  },
});
standalone.form.state.values.display satisfies string;
// @ts-expect-error form values are derived from defaults, not query data
standalone.form.state.values.nested;
// @ts-expect-error field updates must match the field value type
standalone.form.setFieldValue("display", 123);
// @ts-expect-error bindings no longer have a participant wrapper
standalone.participant;

// @ts-expect-error every form must declare its initial values
useQueryBackedForm({ query, endpoint: { mutationFn: mutateAsync } });

useComposableForm({
  id: "dependent-binding",
  defaultValues: { name: "" },
  dependencies: [binding] as const,
  toMutationPayload: (values, { results }) => {
    results.profile?.profile.id satisfies string | undefined;
    // @ts-expect-error only declared dependencies appear in results
    results.operations;
    return values;
  },
  endpoint: { mutationFn: mutateAsync },
});
