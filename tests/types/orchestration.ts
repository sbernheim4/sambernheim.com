import { defineForm } from "../formConfig";
import type { CacheTarget, SaveResult } from "../../src/forms/orchestration/types";
const mutateAsync = async (
  input: {
    name: string;
  },
  _options?: {
    onSuccess?: () => void;
  },
) => {
  return {
    profile: { name: input.name, id: "1" },
  };
};
const profile = defineForm({
  id: "profile",
  snapshot: () => {
    return { displayName: "A" };
  },
  validate: () => {
    return { valid: true };
  },
  toMutationPayload: (values) => {
    return { name: values.displayName };
  },
  endpoint: {
    mutationFn: mutateAsync,
  },
  cacheUpdates: [
    {
      queryKey: ({ response, variables }) => {
        return [response.profile.id, variables.name];
      },
      getData: (response) => {
        return response.profile;
      },
    },
    {
      queryKey: () => {
        return ["name"];
      },
      getData: (response) => {
        return response.profile.name;
      },
    },
    {
      queryKey: () => {
        return ["envelope"];
      },
    },
  ],
  onSuccess: ({ response, variables, formValues }) => {
    response.profile.name satisfies string;
    variables.name satisfies string;
    formValues.displayName satisfies string;
    // @ts-expect-error unrelated response
    void response.operations;
  },
});
defineForm({
  id: "dependent",
  dependencies: [profile],
  snapshot: () => {
    return { name: "B" };
  },
  validate: () => {
    return { valid: true };
  },
  toMutationPayload: (values, { results }) => {
    return {
      name: results.profile?.profile.name ?? values.name,
    };
  },
  endpoint: {
    mutationFn: mutateAsync,
  },
  cacheUpdates: [
    {
      queryKey: ({ results }) => {
        return [results.profile?.profile.id];
      },
    },
  ],
});
// @ts-expect-error mapper is required when form and mutation shapes differ
defineForm({
  id: "bad",
  snapshot: () => {
    return { display: "A" };
  },
  validate: () => {
    return { valid: true };
  },
  endpoint: { mutationFn: mutateAsync },
});
defineForm({
  id: "bad",
  snapshot: () => {
    return { name: "A" };
  },
  validate: () => {
    return { valid: true };
  },
  endpoint: { mutationFn: mutateAsync },
  // @ts-expect-error endpoint input must not widen to mapper result
  toMutationPayload: () => {
    return { name: 1 };
  },
});
defineForm({
  id: "bad",
  snapshot: () => {
    return { name: "A" };
  },
  validate: () => {
    return { valid: true };
  },
  endpoint: {
    // @ts-expect-error mutate returns void
    mutationFn: (_input: { name: string }) => {},
  },
});
const identity: CacheTarget<
  {
    name: string;
  },
  {}
> = {
  queryKey: () => {
    return ["identity"];
  },
};
// @ts-expect-error unrelated cache data requires selector
const incorrect: CacheTarget<
  {
    name: string;
  },
  {},
  number
> = {
  queryKey: () => {
    return ["incorrect"];
  },
};
declare const result: SaveResult<readonly [typeof profile]>;
result.responses.profile?.profile.name satisfies string | undefined;
// @ts-expect-error response keyed by literal form ID
void result.responses.operations;
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
  toFormData: (data) => {
    return { display: data.name, active: data.nested.active };
  },
  toMutationPayload: (v) => {
    return { name: v.display };
  },
  endpoint: { mutationFn: mutateAsync },
});
binding.form.state.values.display satisfies string;
binding.form.state.values.active satisfies boolean;
// @ts-expect-error query fields are not form fields
void binding.form.state.values.nested;
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
  toFormData: (data) => {
    return { display: data.name };
  },
  // @ts-expect-error incorrect mutation payload type
  toMutationPayload: () => {
    return { name: 12 };
  },
  endpoint: { mutationFn: mutateAsync },
});
// @ts-expect-error renamed form requires a payload mapper
useComposableForm({
  id: "bad",
  defaultValues: { display: "" },
  query,
  toFormData: (data) => {
    return { display: data.name };
  },
  endpoint: { mutationFn: mutateAsync },
});

// The single signatures infer defaults, mappings, responses, and dependencies.
const standalone = useQueryBackedForm({
  defaultValues: { display: "" },
  query,
  toFormData: (data) => {
    return { display: data.name };
  },
  toMutationPayload: (values) => {
    return { name: values.display };
  },
  endpoint: { mutationFn: mutateAsync },
  onSuccess: ({ response, variables, formValues }) => {
    response.profile.id satisfies string;
    variables.name satisfies string;
    formValues.display satisfies string;
    // @ts-expect-error callbacks must retain the actual response shape
    void response.task;
  },
});
standalone.form.state.values.display satisfies string;
// @ts-expect-error form values are derived from defaults, not query data
void standalone.form.state.values.nested;
// @ts-expect-error field updates must match the field value type
standalone.form.setFieldValue("display", 123);
// @ts-expect-error bindings no longer have a participant wrapper
void standalone.participant;

// @ts-expect-error every form must declare its initial values
useQueryBackedForm({ query, endpoint: { mutationFn: mutateAsync } });

useComposableForm({
  id: "dependent-binding",
  defaultValues: { name: "" },
  dependencies: [binding] as const,
  toMutationPayload: (values, { results }) => {
    results.profile?.profile.id satisfies string | undefined;
    // @ts-expect-error only declared dependencies appear in results
    void results.operations;
    return values;
  },
  endpoint: { mutationFn: mutateAsync },
});

// Submitted configuration is read-only, including nested declarations.
const checkImmutableConfig = (
  config: import("../../src/forms/orchestration/types").SaveConfig<readonly [typeof profile]>,
) => {
  // @ts-expect-error submitted form lists cannot be replaced
  config.forms = [];
  // @ts-expect-error submitted form lists cannot be appended to
  config.forms.push(profile);
  // @ts-expect-error endpoint functions cannot be replaced during a run
  config.forms[0].endpoint.mutationFn = mutateAsync;
  if (config.retry) {
    // @ts-expect-error retry policies cannot be changed during a run
    config.retry.maxRetries = 5;
  }
  if (config.cacheUpdates?.[0]) {
    // @ts-expect-error cache targets cannot be changed during a run
    config.cacheUpdates[0].queryKey = () => {
      return ["replacement"];
    };
  }
};
void checkImmutableConfig;

// Domain fields retain their names and allowed values through the form binding.
const checkDomainFields = (
  organization: ReturnType<
    typeof import("../../src/features/workspace/organizations/hooks/useOrganizationForm").useOrganizationForm
  >,
  project: ReturnType<
    typeof import("../../src/features/workspace/projects/hooks/useProjectForm").useProjectForm
  >,
  task: ReturnType<
    typeof import("../../src/features/workspace/tasks/hooks/useTaskForm").useTaskForm
  >,
) => {
  organization.form.setFieldValue("sector", "finance");
  project.form.setFieldValue("priority", "high");
  task.form.setFieldValue("status", "todo");
  // @ts-expect-error fields belong to their entity
  organization.form.setFieldValue("title", "Wrong field");
  // @ts-expect-error sector must be a declared option
  organization.form.setFieldValue("sector", "unknown");
  // @ts-expect-error priority must be a declared option
  project.form.setFieldValue("priority", "urgent");
  // @ts-expect-error task status is distinct from organization status
  task.form.setFieldValue("status", "active");
};
void checkDomainFields;
