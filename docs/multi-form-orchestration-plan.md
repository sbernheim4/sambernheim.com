# Domain Form Hooks And Multi-Form Orchestration

Status: implementation plan. Saving this document does not implement the feature.

## Goal And Public API

Provide composable form orchestration for a page that presents several resource
forms as one logical form. Each resource retains its own values, validation,
endpoint, cache updates, and effect definitions. One page-level action coordinates
the complete save lifecycle.

`useQueryBackedForm` is the simpler CRUD API: get a resource from one read endpoint,
initialize its form, and save changes through one write endpoint. It should
internally use the same composable machinery as the multi-form API. Consumers of
the simple API should not have to create participants or configure an orchestrator.

Use `useFormOrchestrator` as the composable public hook name. Earlier discussion
called this `useMultiFormOrchestrator`; these refer to one proposed hook, not two.

```text
Pure contracts, validation results, and state transitions
                         |
                         v
UI-independent orchestration executor and query lifecycle
                         |
                         v
                useFormOrchestrator
                         ^
                         |
                 useQueryBackedForm
                 Simple CRUD facade
```

The existing `useSaveFlow` handles endpoint steps with shared response context.
It does not currently coordinate independent form instances. Retain its dependent
endpoint-flow capability while sharing lifecycle execution with the new mechanism.

## Preparation: Domain Hooks And Boundaries

Introduce domain-specific query hooks such as `useOrganizations`,
`useOrganization`, `useOrganizationProjects`, `useProject`, `useProjectTasks`,
and `useTask`. Introduce domain form hooks such as `useOrganizationForm`,
`useProjectForm`, and `useTaskForm`. Every domain write, including form saves,
has a domain-specific mutation hook, such as `useUpdateOrganizationProfile`,
`useUpdateOrganizationOperations`, `useUpdateProject`, or `useCreateTask`.
Non-form writes include the existing clear-workspace operation.

Routes and views consume these hooks instead of calling `useQuery` or
`useMutation` directly. Generic infrastructure may use TanStack primitives.
Domain hooks own endpoint selection, input mapping, query keys, and lifecycle
configuration. Views own rendering and presentation choices.

### Domain Mutation Ownership

Form hooks obtain their `mutationFn` from a domain mutation hook's `mutateAsync`.
They do not import an HTTP write function and wrap it in another `useMutation`.
The domain mutation hook owns the request, mutation key, and per-request TanStack
mutation state. The form binding owns query-to-form and form-to-input mappings.
The orchestrator owns sequencing, retries, and the coordinated post-save lifecycle.

```text
Domain query hook ---------------------> Domain form hook
                                               ^
HTTP client -> Domain mutation hook ------------|
                         mutateAsync           |
                                               v
                                      Form participant
                                               |
                                               v
                                       Orchestrator
                            saves -> refetches -> cache -> effects
```

The executor receives only a typed promise-returning function; it need not know
whether that function comes from TanStack Query. At the application composition
boundary, pass `mutation.mutateAsync` as `endpoint.mutationFn`. Infer mutation input
from its first parameter and response from its awaited return type. Ignore the
optional per-call mutation-options parameter when deriving form input types.
This preserves inference through `toMutationPayload`, `getData`, and `queryKey`.

Domain hooks can expose both `mutate` and `mutateAsync` for ordinary consumers,
but orchestration uses `mutateAsync`: `mutate` returns `void` and cannot be awaited
for the response. The orchestrator must not accept it as a save function or infer
success by watching mutation state. No callback-to-promise adapter is needed
when the domain hook already supplies `mutateAsync`.

Domain mutation hooks used in this pipeline do not automatically refetch, inject
cache values, or show success toasts in `onSuccess`/`onSettled`. Those definitions
remain configurable at the form/domain lifecycle boundary and are executed by
the orchestrator, including for standalone `useQueryBackedForm`. Set mutation
`retry: false` explicitly so inherited QueryClient defaults cannot multiply the
orchestrator's retries. Audit global mutation callbacks for conflicting effects
when implementing this boundary.

Do not put another per-resource mutation around `mutateAsync`. The orchestrator
tracks its own aggregate state separately; the underlying domain mutation's
`isPending` describes only its request, while the orchestrator stays busy through
refetches, reconciliation, and effects.

- Keep domain contracts and field option data independent of React.
- Keep immutable cache transforms separate from HTTP and QueryClient operations.
- Keep HTTP clients separate from hooks and UI.
- Keep query and save hooks free of imports from field components or feature views.
- Keep TanStack Form registration and form-to-participant adapters in the explicit
  bindings layer. UI fields consume form contexts and contain no endpoint logic.
- Keep the executor independent of React, TanStack Form, and rendered components.
  An async executor that calls saves or effects is not a pure function; its state
  transitions and result calculations are the pure pieces.

Add resource-specific list/detail reads and query keys for organizations,
projects, tasks, organization profiles, and organization operations. The existing
bootstrap endpoint may remain for the demo routes during migration. Workspace
views migrate to domain hooks, and domain cache policies reconcile every affected
list/detail query from the authoritative save response.

## Form Participants And Composition

A domain form hook exposes its form instance separately from an opaque, typed
save participant. The participant contract must not contain a UI component or
require a TanStack `FormApi` instance. Its adapter supplies operations for reading
values, validating, saving, and accepting a saved baseline.

The participant carries:

- A stable ID, unique within the orchestrator.
- A snapshot of its values for a submission and asynchronous validation of those
  values, with errors mapped back to its own fields.
- A save function and a typed response, retaining the submitted variables.
- Its refetch functions, invalidation keys, authoritative cache transformations,
  and form-level `onSuccess`/`onFailure` callbacks.
- An optional retry policy overriding the orchestrator's retry defaults.

Capture all values at submission time and validate all participants before any
write. The current run uses that snapshot throughout retries. Support typed
input mapping from earlier successful responses for ordered dependencies. Values
derived from those responses are resolved immediately before the dependent save;
invalid derived inputs fail that participant before its request is issued.

Do not call a child's existing full form-submit lifecycle from the orchestrator.
Call its domain mutation's request-only `mutateAsync` through the participant;
calling a legacy mutation that already runs form effects would allow refetches
and toasts to run prematurely.
Entity hooks define their lifecycle; the orchestrator executes it exactly once
per submission phase. The single-form facade uses the same path for one participant.

`useFormOrchestrator` accepts ordered participants, retry defaults, group lifecycle
configuration, and partial-failure handling. It returns `submit`, aggregate phase
and saving state, per-participant status/attempt count, a structured result, and
`reset`. Reject duplicate IDs before any write and prevent overlapping submissions
from the same orchestrator.

`useQueryBackedForm` accepts domain query options, mapping from query data to form
values, and a single endpoint/lifecycle configuration. It handles loading and
read errors, initializes the form when data arrives, and delegates saving to a
one-participant orchestrator. Background reads must not overwrite dirty edits.
Successful writes establish a clean baseline in the form's own value shape, as
described below. Preserve current
call sites through a default-values mode while migrating domain form hooks to
the query-backed configuration.

### Flat Refetch And Invalidation Options

Replace the proposed nested `refetchPolicy` with two independent sibling options
alongside `mutationFn` and `cacheUpdates`. Expose the same refresh
options at the group level. Both can be supplied together:

```ts
type RefreshOptions = {
  refetchFunctions?: Array<() => unknown>
  invalidateQueryKeys?: QueryKey[]
}
```

`refetchFunctions` accepts query-hook `refetch` methods directly, ordinary
synchronous functions, and functions returning promises. No callback arguments
or return payload shape are required. Await promise/thenable returns, ignore
return values, and capture synchronous throws as refresh failures. A callback
that starts asynchronous work must return its promise for the orchestrator to
wait for it; fire-and-forget work cannot be coordinated.

`invalidateQueryKeys` contains TanStack Query keys. Invalidate each key using
normal prefix matching, marking matching queries stale and awaiting active-query
refetches triggered by invalidation. Inactive queries remain stale until their
next fetch. A key may include IDs captured by the domain hook.

Execute both lists during the refresh phase for successful children and the
group. Collect failures while waiting for every scheduled operation to settle.
Only then run `getData`/advanced cache updaters and cache injection. If a custom
refetch and an invalidation overlap, every initiated fetch must still settle or
be cancelled before injection; do not infer arbitrary callback targets.

An endpoint configuration can therefore contain:

```ts
endpoint: {
  mutationFn: mutation.mutateAsync,
  refetchFunctions: [profileQuery.refetch, () => refreshSummary()],
  invalidateQueryKeys: [workspaceKeys.organizations.list()],
  cacheUpdates: [{
    queryKey: () => workspaceKeys.organizationProfiles.detail(organizationId),
    getData: (response) => response.profile,
  }],
}
```

Adapt the existing `refetchPolicy` only at the legacy compatibility boundary;
new public examples and domain hooks use the flattened options.

### Typed Query/Form/Mutation Transformations

Expose two independent, synchronous, pure mapping functions through both
`useComposableForm` and `useQueryBackedForm`:

```ts
type FormTransforms<TQueryData, TFormValues, TMutationInput, TResults = {}> = {
  toFormData: (queryData: TQueryData) => TFormValues
  toMutationPayload: (
    formValues: TFormValues,
    context: { results: TResults },
  ) => TMutationInput
}
```

`toFormData` receives the successful data exposed by the domain query hook (after
any query `select`) and returns the values used by the form. Infer its argument
from that query and its return type as the form value type. Do not call it with
loading-state `undefined` or assume the query data and form values have the same
shape. It must not mutate the query cache or its input.

`toMutationPayload` receives the validated form snapshot and returns the argument
passed to `mutationFn`. Its return type must conform to the configured mutation
function's input type; infer that type from the endpoint rather than widening the
endpoint to accept whatever the mapper returns. Its optional-to-use second
argument exposes typed earlier results for response-dependent inputs. Ordinary
CRUD mappings only need the first argument.

Allow a mapper to be omitted only when identity is type-safe across that boundary.
Default `toFormData` to identity with form values inferred as query data. Default
`toMutationPayload` to identity only if those form values satisfy the mutation's
input contract; otherwise require the mapping at compile time. Explicit mappers
support different shapes without assertions or `any` at call sites.

Keep these stages distinct from response selection:

```text
Query data --toFormData--> Form values
                            |
                     validate snapshot
                            |
                     toMutationPayload
                            |
                            v
                       Mutation input --mutationFn--> Mutation response
                                                           |
                                                  await all refetches
                                                           |
                                                        getData
                                                           |
                                                           v
                                               Value stored at queryKey(...)
```

After form validation, map inputs before issuing writes where no earlier response
is required. Resolve dependency-based inputs immediately before their save.
Mapping errors prevent that request and are not automatically retried. Compute
each mutation input once per run and reuse it for retries. Lifecycle
`variables` means the mapped mutation input; retain `formValues` separately in
the submission context for form state and effects.

The returned `getData` value must match the target query cache's underlying data
shape, which may differ from both a query's selected data and the form values.
Do not implicitly use `toFormData` for cache injection or apply it to an unrelated
mutation-response envelope. Reset successful forms to the submitted form snapshot
by default. Server-normalized values may replace that baseline only through the
explicit query-data-to-values mapping when an authoritative, compatible query
value is available; never reset from a lagging refetch or overwrite subsequent
unsaved edits.

### Typed Response-To-Cache Configuration

Each form declares one or more `cacheUpdates`. Every target has a required
`queryKey` function and an optional `getData` function. This same contract is
available through both `useComposableForm` and the simpler `useQueryBackedForm`.

```ts
type CacheTarget<TResponse, TVariables, TData = TResponse, TResults = {}> = {
  queryKey: (context: {
    response: TResponse
    variables: TVariables
    results: TResults
  }) => QueryKey
  getData?: (response: TResponse) => TData
}
```

This illustrates the callback contract; the public implementation must infer
`TResponse` from the awaited return type of the configured `mutationFn` and infer
`TVariables` from that function's input. `getData` receives that exact response
type as its argument, not `unknown`, `any`, or a context wrapper. Its return type
determines the value injected into that target's cache. Each target can select
a different value type from the same endpoint response.

Omitting `getData` means the identity function, `(response) => response`: inject
the full mutation response, with the cached value typed as `TResponse`. Use
inference/overloads that preserve this default; do not permit an unrelated cache
value type to be claimed without supplying a selector. A returned `undefined`
follows TanStack Query's no-update semantics, rather than meaning delete.

`queryKey` is always a function, including for fixed keys (`() => ['profile']`).
It can use the current save response, submitted variables, typed results from
earlier successful participants, or captured dependencies such as organization ID.
Resolve the key against the submission's retained context, not subsequently edited
form values. Never resolve it during rendering or before its required response
exists. Do not erase response types when heterogeneous participants are composed.

After every scheduled refetch has settled, resolve the target's key, select its
data, and write that value with `queryClient.setQueryData`. Replacement is the
default; there is no implicit merging of objects or lists. Retain a separate
advanced updater variant for list upserts and summary-field merging, using the
existing `(previous, context) => next` callback and the same functional `queryKey`.
A target uses either `getData`/identity replacement or an advanced updater, never
both. Adapt legacy static keys at the compatibility boundary.

For example, if `updateOrganizationProfile` returns
`Promise<{ profile: OrganizationProfile; readModelLagMs: number }>`, then:

```ts
cacheUpdates: [{
  queryKey: ({ response }) =>
    workspaceKeys.organizationProfiles.detail(response.profile.organizationId),
  getData: (response) => response.profile,
  // response is inferred as { profile: OrganizationProfile; readModelLagMs: number }.
}]
```

When an endpoint already returns precisely the desired cached resource:

```ts
cacheUpdates: [{
  queryKey: ({ variables }) => ['resource', variables.id],
  // No getData: cache the entire mutation response.
}]
```

Selector/key failures are cache-reconciliation errors. Retain the successful
write result, attempt other cache targets, and never retry the mutation because
response selection or cache-key resolution failed.

## Lifecycle, Retries, And Failures

The selected execution model is ordered only. Declared order implies dependency:
after a save exhausts retries, every later participant is skipped. Dependency
graphs, parallel groups, and continuation of unrelated branches are outside this
implementation, superseding the earlier request for branch continuation.

1. Capture and validate every participant. Validation failure causes no writes.
2. Save participants in declared order, recording each successful response as
   soon as its endpoint succeeds.
3. Retry a failed save according to its policy, using the same input snapshot.
   Stop later participants when retries are exhausted.
4. Collect `refetchFunctions` and `invalidateQueryKeys` from successful children
   and the group. Run the group refresh phase even when some writes failed so
   successfully saved data can be reconciled.
5. Await every scheduled invalidation/refetch, including custom refetch functions.
   A rejected refresh must not end this wait while other refreshes are pending.
6. Apply successful participants' authoritative cache updates in declared order,
   followed by group cache updates. All cache injection occurs after all
   configured refetches settle, even on partial save or refresh failure.
7. Update successful forms' saved baselines. Failed/skipped forms retain edits.
8. Invoke individual form outcome callbacks in declared order: `onSuccess` for
   successful writes and `onFailure` for the failed form. Skipped forms receive
   neither. Await these callbacks, then invoke group `onSuccess` if every write
   succeeded or group `onFailure` with the full partial result otherwise.

Refetches belong in `refetchFunctions`/`invalidateQueryKeys`. Application actions,
including toasts, belong in `onSuccess`/`onFailure`. Neither the executor nor
generic hooks import a toast library. Individual and group callbacks are both
supported, and neither layer suppresses the other.

Track save errors, refresh errors, cache-reconciliation errors, and after-effect
errors separately. A refresh or toast failure must not turn an acknowledged save
into an unsaved resource, trigger a write retry, or erase its recorded response.
Attempt remaining cache updates/effects after an individual callback fails and
report their errors. Report a saved-with-follow-up-errors outcome when appropriate,
so the UI does not misleadingly recommend repeating successful writes.

Retries are configurable by count, delay, and error predicate. `maxRetries`
counts retries after the initial attempt. Default to one retry for retry-safe
transient failures, with a 500 ms delay; validation and permanent client failures
do not retry. Disable underlying automatic mutation retries so only one layer
owns the policy. Create endpoints require idempotency support before enabling
automatic retries. The example uses idempotent updates to existing children.

Expose validation-failed, success, partial-failure, and
saved-with-follow-up-errors results, with participant IDs, statuses, attempts,
submitted variables, successful responses, and phase-specific errors. No
cross-endpoint atomicity or automatic rollback is promised. Do not automatically
resubmit successful participants after a lifecycle error.

### Individual And Group Outcome Callbacks

Provide optional `onSuccess` and `onFailure` on each domain form configuration
and on `useFormOrchestrator`. `useQueryBackedForm` exposes the same callbacks for
its one form. These are coordinated lifecycle callbacks, distinct from the
domain mutation hook's immediate TanStack Query callbacks.

An individual form's `onSuccess` receives its typed mutation `response`, mapped
`variables`, submitted `formValues`, participant ID, and any follow-up errors.
Infer these types from its query, transformations, and domain `mutateAsync`.
`onFailure` receives an `unknown` error, the form snapshot, participant ID,
attempt count, and a phase discriminant (`validation`, `mapping`, or `save`).
Include mapped variables when available; validation/mapping failures need not
have a valid mutation payload or response.

At group level, both callbacks receive `{ result }`, the aggregate result with
typed responses keyed by participant ID, each participant's status and attempts,
and phase-specific errors. Group `onFailure` covers validation failures and
partial saves, replacing a separate public `onPartialFailure` option.

- Each callback has signature `(context) => void | Promise<void>` and defaults
  to no action. Callers can compose several actions inside one callback.
- Success callbacks run after all configured refetches and cache injections,
  never immediately on the endpoint response.
- Failure callbacks run once for the final outcome, not on intermediate retries.
  For a write failure, reconcile successful writes before invoking callbacks.
  For validation failure, report invalid forms and the aggregate result without
  starting writes or refreshes. Skipped/otherwise valid forms get no callback.
- Individual callbacks execute in declared order, then the group callback.
  A successful earlier form still receives `onSuccess` on a partially failed run.
- A persisted write remains successful if a refresh/cache operation fails.
  Success contexts expose those follow-up errors so applications can distinguish
  saved-with-warnings from clean success. Do not fire both outcome callbacks for
  the same form merely because reconciliation had an error.
- Catch callback failures, record them as follow-up errors, and continue other
  callbacks. Do not retry writes, recursively invoke `onFailure`, or rerun an
  already-called callback because notification code throws.

Replace public `afterEffects` arrays with these callbacks in the new API, and
migrate existing definitions by invoking their actions in the equivalent
`onSuccess` callback in the same order. A temporary legacy adapter may preserve
old callers, but reject configurations supplying both old and new callback
styles. Internal effect execution helpers may remain. Do not register a
standalone form callback twice when `useQueryBackedForm` creates its internal
one-participant orchestrator.

No built-in toast configuration, toast dependency, or automatic message is
required. A caller can supply `onSuccess: () => toast.success('Saved')` or
`onFailure: ({ error }) => toast.error(formatError(error))` as ordinary callbacks.
The same interface also supports navigation and analytics without UI coupling.

## Composite Organization Example

Split the organization's editable configuration into two child resources, one
of each per organization. Keep the organization as the parent identity and keep
projects and tasks attached to it.

```text
+--------------------------+
| Organization             |
| id                       |
+--------------------------+
      |             |
      | 1:1         | 1:1
      v             v
+----------------+  +------------------------+
| Profile        |  | Operations             |
| organizationId |  | organizationId         |
| name           |  | status                 |
| sector         |  | region                 |
| updatedAt      |  | updatedAt              |
+----------------+  +------------------------+

Organization -- 1:many --> Project -- 1:many --> Task
```

Add separate GET/PATCH endpoints at
`/api/organizations/:id/profile` and `/api/organizations/:id/operations`.
Seed both children for existing organizations and initialize them when creating
an organization. Name/sector belong to Profile; status/region belong to Operations.
Existing organization list/detail responses may project these values for
compatibility, but there must be one authoritative owner for each field. Legacy
organization saves delegate to those owners rather than maintaining duplicate
writable configuration. Clear-all removes the new resources too.

Preserve the simulated read-replica lag. A child's PATCH response is authoritative
for its detail cache and any organization summaries displaying its fields.

Add `useOrganizationProfile`, `useOrganizationOperations`,
`useOrganizationProfileForm`, and `useOrganizationOperationsForm`.
The two form hooks compose through the lower-level form adapter and participant
contract, so neither requires its own standalone save lifecycle.

The organization configuration page at
`/organizations/:organizationId/configuration` looks like this:

```text
+-----------------------------------------------------------+
| Organizations > Existing Clinic > Configuration            |
|                                                           |
| Organization configuration                                |
|                                                           |
| Profile                                                   |
| Name       [Existing Clinic                            ]  |
| Sector     [Healthcare                                v]  |
|                                                           |
| Operations                                                |
| Status     (o) Active  ( ) Paused                          |
| Region     [East                                      v]  |
|                                                           |
|                                     [Save all changes]    |
|                                                           |
| Projects                                    [New project] |
| Care Navigation                                      ->   |
+-----------------------------------------------------------+
```

### Small Two-Form Implementation Example

The following shows the proposed API, not code that exists today.
`useComposableForm` is the lower-level TanStack Form binding: it initializes
values from a domain query and returns `{ form, participant, isReady }`. It
defines a participant without executing a save lifecycle. Its participant
adapter owns snapshotting, validation, and accepting the saved baseline.
`useQueryBackedForm` can use this same binding plus a one-participant orchestrator
internally, exposing one simple CRUD hook to its callers.

First, request-only domain mutation hooks own the API calls. `ProfileInput` and
`OperationsInput` are domain request types, while the API functions retain their
typed response envelopes:

```tsx
function useUpdateOrganizationProfile(organizationId: string) {
  return useMutation({
    mutationKey: ['organization-profile', organizationId, 'update'],
    mutationFn: (input: ProfileInput) =>
      updateOrganizationProfile(organizationId, input),
    retry: false,
  })
}

function useUpdateOrganizationOperations(organizationId: string) {
  return useMutation({
    mutationKey: ['organization-operations', organizationId, 'update'],
    mutationFn: (input: OperationsInput) =>
      updateOrganizationOperations(organizationId, input),
    retry: false,
  })
}
```

Two domain form hooks compose the read and mutation hooks with form mappings
and cache policies:

```tsx
function useOrganizationProfileForm({ organizationId, onSuccess, onFailure }) {
  const query = useOrganizationProfile(organizationId)
  const mutation = useUpdateOrganizationProfile(organizationId)

  return useComposableForm({
    id: 'profile',
    query,
    onSuccess,
    onFailure,
    toFormData: (profile) => ({
      displayName: profile.name,
      selectedSector: profile.sector,
    }),
    toMutationPayload: (values) => ({
      name: values.displayName.trim(),
      sector: values.selectedSector,
    }),
    endpoint: {
      mutationFn: mutation.mutateAsync,
      refetchFunctions: [query.refetch],
      invalidateQueryKeys: [workspaceKeys.organizations.detail(organizationId)],
      cacheUpdates: [{
        queryKey: ({ response }) =>
          workspaceKeys.organizationProfiles.detail(response.profile.organizationId),
        getData: (response) => response.profile,
      }],
    },
  })
}

function useOrganizationOperationsForm({ organizationId, onSuccess, onFailure }) {
  const query = useOrganizationOperations(organizationId)
  const mutation = useUpdateOrganizationOperations(organizationId)

  return useComposableForm({
    id: 'operations',
    query,
    onSuccess,
    onFailure,
    toFormData: (operations) => ({
      isActive: operations.status === 'active',
      region: operations.region,
    }),
    toMutationPayload: (values) => ({
      status: values.isActive ? 'active' : 'paused',
      region: values.region,
    }),
    endpoint: {
      mutationFn: mutation.mutateAsync,
      refetchFunctions: [query.refetch],
      invalidateQueryKeys: [workspaceKeys.organizations.detail(organizationId)],
      cacheUpdates: [{
        queryKey: () => workspaceKeys.organizationOperations.detail(organizationId),
        getData: (response) => response.operations,
      }],
    },
  })
}
```

The Profile form uses `displayName` and `selectedSector`, while its API uses
`name` and `sector`. The Operations form uses a boolean `isActive`, while its API
uses a status string. `toFormData` and `toMutationPayload` bridge those differences;
the field components bind to the form-specific names and types.

The selectors above extract each child resource from its PATCH response envelope.
Their response arguments are inferred from their respective `mutationFn`, and
their keys demonstrate both response-derived and captured dependencies. Additional
advanced cache targets merge owned fields into cached organization summaries;
those targets are omitted here for brevity. These declarations do not write the
cache when a domain hook renders. Types and imports are omitted from this sketch;
the implementation must infer each form's values and response.

The page composes those two hooks without knowing their endpoints or query keys:

```tsx
const profile = useOrganizationProfileForm({
  organizationId,
  onSuccess: ({ response }) => markProfileSaved(response.profile),
  onFailure: ({ error }) => showProfileError(error),
})
const operations = useOrganizationOperationsForm({
  organizationId,
  onSuccess: ({ response }) => markOperationsSaved(response.operations),
  onFailure: ({ error }) => showOperationsError(error),
})

const save = useFormOrchestrator({
  forms: [profile.participant, operations.participant],
  retry: { maxRetries: 1, delayMs: 500 },
  onSuccess: ({ result }) => showSaveNotification(result),
  onFailure: ({ result }) => showConfigurationFailure(result),
})

return (
  <form onSubmit={(event) => {
    event.preventDefault()
    void save.submit()
  }}>
    <fieldset disabled={save.isSaving || !profile.isReady || !operations.isReady}>
      <ProfileFields form={profile.form} />
      <OperationsFields form={operations.form} />
      <button type="submit">Save all changes</button>
    </fieldset>
  </form>
)
```

For this page the actual sequence is:

```text
Validate Profile and Operations
  -> PATCH Profile (retain response)
  -> PATCH Operations (retain response)
  -> await all child and group refetches
  -> inject Profile and Operations responses into their caches
  -> await each child's onSuccess
  -> invoke group onSuccess (e.g. one success notification)
```

If Operations exhausts its retries, Profile still goes through refetch, cache
injection, and its `onSuccess`. Operations keeps its unsaved values and receives
`onFailure`. The orchestrator then invokes its `onFailure` with the partial result
instead of its `onSuccess` callback.

Render one outer HTML form, with section components and no nested forms. Loading
or failure of either required resource prevents submission. Show aggregate and
per-child progress, including retries and skipped forms. If Profile saves and
Operations fails, show the saved Profile and retain Operations edits. Projects
remain listed below the configuration, with existing drill-down navigation.
Link the page from the organization detail and the Forms Index.

## Implementation Order And Verification

1. Introduce domain query/form hooks and migrate routes/views to them.
   Introduce domain mutation hooks for all writes and supply their `mutateAsync`
   functions to form bindings.
2. Extract shared participant, executor, and query lifecycle contracts; retain
   the existing standalone and dependent-flow behavior during migration.
3. Add `useFormOrchestrator` and implement `useQueryBackedForm` as its simpler
   one-resource facade with query initialization.
4. Add Profile/Operations resources, domain hooks, and the composed example.
5. Update the form boundary documentation and verify migrated call sites.

Test pure state calculations and the UI-independent executor with fake
participants, and cache behavior with a real QueryClient. Cover validation before
writes, snapshot consistency, ordered execution, response-derived inputs,
configurable retries, duplicate IDs, overlapping submissions, stop/skip behavior,
and preservation of successful results on partial failure.

Test that all child/group refetches settle before any response injection, stale
replicas cannot erase the submitted responses at reconciliation, rejected
refreshes still permit cache updates, and child/group effects execute once in the
specified order. Verify follow-up failures never retry successful writes.

Verify domain query keys and form initialization, preservation of dirty edits,
saved baselines, standalone CRUD compatibility, and the Profile/Operations
list/detail cache policies. Cover backend child initialization, updates, missing
parents, and clear-all behavior.

Add type-level checks proving that `getData` and `queryKey` infer the mutation's
awaited response type, that different response selectors can produce different
cache types, and that accessing fields from another participant's response is a
type error. Test identity selection, nested response extraction, keys derived
from variables/prior results, missing-selector type defaults, and failure of one
cache target without preventing other successful targets from being applied.

Add type-level checks for query-to-form inference, mutation-input conformance,
and requiring mappers when shapes differ. Test renamed/nested fields, boolean
to enum mapping, identity defaults, query selection versus raw cache data,
mapping failures before writes, stable mapped inputs across retries, and saved
baselines that retain the form's value shape. Include a rejected type example
where `toMutationPayload` returns the wrong field type for the endpoint.

Verify that form saves execute through domain mutation hooks, preserve their
inferred input/response types, and do not create duplicate requests or effects.
Test that `mutate` is rejected by the promise-returning save contract and that
domain mutation retries remain disabled while orchestrator retries are enabled.
Verify aggregate saving state remains active after the domain request settles
until the coordinated lifecycle completes.

Test both refresh options together, direct query-hook refetch functions,
synchronous return values/throws, asynchronous rejections, and overlapping
invalidation/refetch requests. Cache injection must wait for all operations,
including refetches initiated by invalidation, even when another operation fails.

Test individual and group `onSuccess`/`onFailure`, correct response inference,
validation failures without writes, callbacks only after retries/reconciliation,
no callbacks for skipped forms, and child-success/group-failure on partial saves.
Test asynchronous callbacks, callback errors without recursive failure handling,
and migration from `afterEffects` without duplicate notifications. The standalone
facade must invoke each configured callback exactly once per submission outcome.

Run TypeScript checks, focused automated tests, and the production build. Browser
verification is performed by the user; do not add Playwright or another browser
automation dependency.
