import { createParticipant } from '../../src/forms/orchestration/participant.ts'
import type {
  CacheTarget,
  OrchestrationResult,
} from '../../src/forms/orchestration/contracts.ts'
const mutateAsync = async (
  input: { name: string },
  _options?: { onSuccess?: () => void },
) => ({ profile: { name: input.name, id: '1' } })
const profile = createParticipant({
  id: 'profile',
  snapshot: () => ({ displayName: 'A' }),
  validate: () => ({ valid: true }),
  toMutationPayload: (values) => ({ name: values.displayName }),
  endpoint: {
    mutationFn: mutateAsync,
    cacheUpdates: [
      {
        queryKey: ({ response, variables }) => [
          response.profile.id,
          variables.name,
        ],
        getData: (response) => response.profile,
      },
      {
        queryKey: () => ['name'],
        getData: (response) => response.profile.name,
      },
      { queryKey: () => ['envelope'] },
    ],
  },
  onSuccess: ({ response, variables, formValues }) => {
    response.profile.name satisfies string
    variables.name satisfies string
    formValues.displayName satisfies string
    // @ts-expect-error unrelated response
    response.operations
  },
})
createParticipant({
  id: 'dependent',
  dependencies: [profile],
  snapshot: () => ({ name: 'B' }),
  validate: () => ({ valid: true }),
  toMutationPayload: (values, { results }) => ({
    name: results.profile?.profile.name ?? values.name,
  }),
  endpoint: {
    mutationFn: mutateAsync,
    cacheUpdates: [
      { queryKey: ({ results }) => [results.profile?.profile.id] },
    ],
  },
})
// @ts-expect-error mapper is required when form and mutation shapes differ
createParticipant({
  id: 'bad',
  snapshot: () => ({ display: 'A' }),
  validate: () => ({ valid: true }),
  endpoint: { mutationFn: mutateAsync },
})
createParticipant({
  id: 'bad',
  snapshot: () => ({ name: 'A' }),
  validate: () => ({ valid: true }),
  endpoint: { mutationFn: mutateAsync },
  // @ts-expect-error endpoint input must not widen to mapper result
  toMutationPayload: () => ({ name: 1 }),
})
createParticipant({
  id: 'bad',
  snapshot: () => ({ name: 'A' }),
  validate: () => ({ valid: true }),
  endpoint: {
    // @ts-expect-error mutate returns void
    mutationFn: (_input: { name: string }) => {},
  },
})
const identity: CacheTarget<{ name: string }, {}> = {
  queryKey: () => ['identity'],
}
// @ts-expect-error unrelated cache data requires selector
const incorrect: CacheTarget<{ name: string }, {}, number> = {
  queryKey: () => ['incorrect'],
}
declare const result: OrchestrationResult<readonly [typeof profile]>
result.responses.profile?.profile.name satisfies string | undefined
// @ts-expect-error response keyed by literal participant ID
result.responses.operations
void identity
void incorrect

import { useComposableForm } from '../../src/forms/bindings/useComposableForm'
import { useQueryBackedForm } from '../../src/forms/bindings/useQueryBackedForm'
const query = {
  data: { name: 'A', nested: { active: true } },
  isPending: false,
  isError: false,
}
const binding = useComposableForm({
  id: 'profile',
  query,
  toFormData: (data) => ({ display: data.name, active: data.nested.active }),
  toMutationPayload: (v) => ({ name: v.display }),
  endpoint: { mutationFn: mutateAsync },
})
binding.form.state.values.display satisfies string
binding.form.state.values.active satisfies boolean
// @ts-expect-error query fields are not form fields
binding.form.state.values.nested
useQueryBackedForm({
  query,
  endpoint: { mutationFn: mutateAsync },
  onSuccess: ({ response }) => {
    response.profile.name satisfies string
  },
})
useComposableForm({
  id: 'bad',
  query,
  toFormData: (data) => ({ display: data.name }),
  // @ts-expect-error incorrect mutation payload type
  toMutationPayload: () => ({ name: 12 }),
  endpoint: { mutationFn: mutateAsync },
})
// @ts-expect-error renamed form requires a payload mapper
useComposableForm({
  id: 'bad',
  query,
  toFormData: (data) => ({ display: data.name }),
  endpoint: { mutationFn: mutateAsync },
})
