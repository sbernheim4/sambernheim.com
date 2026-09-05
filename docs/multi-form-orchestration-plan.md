# Domain Form Hooks And Multi-Form Orchestration

Status: implementation in progress. See the live checklist below; the handoff
notes remain historical context.

## Live Implementation Checklist (2026-09-05)

- [x] Inspect handoff and preserve starting revisions; use jj exclusively.
- [x] Resource list/detail reads, keys, structured API errors, request-only domain mutations.
- [x] Migrate demo query calls and requests to domain hooks.
- [x] Typed opaque participants, mappings, cache targets, lifecycle callbacks, type-test configuration.
- [x] Ordered executor: validation, snapshots, dependencies, retries, partial results, refresh/cache/effects.
- [ ] React bindings and standalone CRUD compatibility; query initialization and saved baselines.
- [ ] Extract resource/demo domain form hooks and migrate workspace resource reads.
- [ ] Profile/Operations backend ownership, reads, writes, initialization, clear-all.
- [ ] Resource cache projections and clear-all lifecycle coordination.
- [ ] Composed configuration page, navigation, per-child/aggregate feedback, projects.
- [ ] Focused executor, binding, cache, API and compile-time regression coverage.
- [ ] Shared dependent-flow lifecycle, boundary documentation, final build and review.

### Revision And Verification Log

- `uvowqtsv`: domain query and mutation hooks. `npm run typecheck` passed.
  Resource-editor migration follows the new binding implementation. Demo flow
  uses a one-argument wrapper to avoid passing flow context as mutateAsync options.
- `zzouoqmm`: typed participants and lifecycle contracts. `npx tsc -p
  tsconfig.tests.json` passed, including negative inference fixtures.
- `lvpoyyzk`: ordered executor and shared lifecycle helpers. Type fixtures and
  all 8 Node tests passed (including existing reconciliation tests). Tests cover
  overlap, preflight errors, partial saves, delayed/rejected refreshes, callback
  failures, retry safety, dependencies, and lifecycle exclusion of clear-all.
- No browser automation or server startup; user owns browser verification.

### Working Notes / Open Issues

- Domain extraction is moved after the new binding to avoid migrating resource
  forms twice. Each validated unit still receives its own jj revision.
- Clear-all currently has its request hook; lifecycle locking and all-resource
  cache removal remain pending.
- Need explicit coverage for snapshot validation (both field and form validators),
  overlapping refreshes, post-save edits, and independent child summary merges.
- Consistency guarantee covers the coordinated lifecycle. Later uncoordinated
  replica reads need a documented limit or separate protection; staleTime alone
  does not provide it.


## Session Handoff And jj Workflow

Handoff recorded on 2026-09-05. The user paused implementation to continue in a
new session. No application implementation changes for this plan have been made.
Only repository inspection, a jj checkpoint, and this handoff documentation have
been completed. The earlier workspace and forms implementation already exists
and is the starting point, not evidence that this plan has been implemented.

Repository: `/Users/sambernheim/monaco-lsp`.

### Preserved Starting Point

- `otryutsq` is the preserved jj change containing all pre-existing workspace
  work and the agreed plan. Its description is
  `checkpoint: workspace forms and agreed orchestration plan`.
- `trzpnmmy` is the child change for this documentation handoff. It was initially
  created as an empty domain-hook revision before the user paused; its description
  is now `docs: record orchestration handoff and jj revision workflow`.
- Prefer these stable jj change IDs over commit hashes, which change when a
  revision is amended. Inspect `jj status` and `jj log` on resuming; later user
  work may have changed the working revision.
- Do not discard or rewrite the checkpoint's unrelated editor, UI, backend, or
  dependency changes. Do not move/push bookmarks unless requested.

### Revision Strategy

The user explicitly requests planned, focused jj revisions and authorizes as
many as needed. The purpose is to make an approach easy to inspect, replace, or
abandon without losing unrelated completed work. Use new child revisions at
validated boundaries; do not accumulate the whole implementation in one change.

Suggested sequence, splitting further when a unit grows too large:

1. `feat(workspace): domain query and mutation hooks` - add resource reads, keys,
   and request-only domain mutation hooks; migrate direct domain query calls.
2. `refactor(workspace): extract domain form hooks` - move entity form setup,
   mapping, and lifecycle declarations out of resource view components.
3. `feat(forms): typed participants and lifecycle contracts` - add the mapper,
   cache selector, flat refresh, retry, and callback contracts with type tests.
4. `feat(forms): ordered orchestration executor` - implement validation,
   snapshots, ordered saves, retries, partial results, reconciliation, and callback
   execution with focused non-React tests.
5. `feat(forms): composable bindings and CRUD facade` - add the React adapters;
   make `useQueryBackedForm` the simpler one-resource facade; verify compatibility
   and the domain `mutateAsync` boundary.
6. `feat(workspace): profile and operations resources` - implement the child
   endpoints, single ownership of fields, initialization, queries, and mutation
   hooks, including clear-all and legacy projections.
7. `feat(workspace): composed organization configuration` - implement the two
   domain form hooks, one Save All page, navigation, status, and project list.
8. `test(forms): verify migration and document boundaries` - close integration
   gaps, update documentation, and perform final checks. Tests for earlier units
   belong in their own revisions as well, not exclusively in this final change.

Start by reading this entire document and inspecting the actual repository. Then
create a fresh implementation change from the handoff revision, for example:

```sh
jj status
jj log -n 8 --no-graph
jj new -m 'feat(workspace): domain query and mutation hooks'
```

At each boundary, review `jj diff`, run relevant checks, describe the completed
change accurately, and create the next revision with `jj new -m '...'`. Each
revision should be coherent and typecheck where feasible. Keep exploratory work
in separate revisions, and record any temporarily failing checks explicitly.

To change direction, first inspect the exact revision and its descendants.
Abandon only the isolated work being replaced; do not blindly abandon a revision
under completed dependent work. Preserve useful portions in a separate change
before dropping an approach, and account for jj descendant rebases/conflicts.
Never use broad restore/reset commands to clean the checkpoint. Leave a concise
revision/test summary for the next handoff.

### Implementation Facts And Constraints

- Existing generic hooks are under `src/forms/query` and form/UI adapters under
  `src/forms/bindings`; domain code is under `src/features/workspace`.
- Existing `useQueryBackedForm` currently wraps default values and a save endpoint.
  It does not yet implement the planned query initialization and participant API.
- Existing `useSaveFlow` handles endpoint steps, not independent form instances.
  It and standalone saves have existing cache-reconciliation helpers to inspect.
- Workspace views currently use a bootstrap-based domain query hook; entity
  editor specifications and HTTP calls are still mixed into `ResourceEditors`.
  The domain query/mutation/form migrations remain outstanding.
- The new APIs in this document are proposals, including `useFormOrchestrator`,
  `useComposableForm`, and the Profile/Operations resources. Do not assume example
  snippets already compile or that their types have been implemented.
- Latest naming decisions are `toFormData`, `toMutationPayload`, `getData`,
  functional `queryKey`, `refetchFunctions`, `invalidateQueryKeys`, `onSuccess`,
  and `onFailure`. Both child forms and the group support refreshes and callbacks.
- Domain mutation hooks supply `mutateAsync`; all refetches settle before any
  authoritative cache injection. Do not move refreshes into mutation callbacks.
- Ordered-only scheduling supersedes earlier discussion of parallel groups or
  independent branch continuation. Preserve partial successes; no atomicity is
  promised across endpoints.
- Do not install Playwright or other browser automation. The user handles browser
  checks. Use focused logic/type tests and builds for automated verification.
- Existing verification commands include `npm run typecheck`, `npm run build`,
  and `node --experimental-strip-types --test tests/cacheReconciliation.test.ts`.
  No implementation verification was run in this handoff-only session.
- A user-managed dev server may already be running. Inspect ports before starting
  another server; do not stop the user's server as incidental cleanup.

### Technical Background And Implementation Caveats

These observations were checked against the repository during handoff. They are
implementation considerations, not claims that the planned fixes already exist.

- The app uses React 19, TanStack Form 1.x, Query 5.x, Router/Start, TypeScript 5.9,
  Vite, and ESM. Inspect the lockfile for exact installed versions. The field
  components use Radix primitives and local CSS with Lucide icons; this is not a
  generated shadcn installation. No UI library replacement is required.
- The client has a QueryClientProvider in `src/routes/__root.tsx` and routes are
  configured with `ssr: false`. Keep query ownership consistent across the forms
  and orchestrator. The module-level client must be revisited if server rendering
  is introduced, but adding SSR is not part of this work.
- `npm run dev` serves frontend routes and `/api/*` through Vite's
  `configureServer` middleware. Backend state is in memory and simulates a 2500 ms
  lag by copying the current write store into the read store after a timeout.
  Backend code changes may restart the server and reset example data.
- The current API middleware is development-only. A successful production build
  does not prove a deployed backend works. `npm start` points at
  `.output/server/index.mjs`, while the observed build emitted `dist/server`.
  Production hosting is a separate existing gap; do not silently expand this
  task into deployment work or claim production API verification.
- TanStack route files generate the route tree. Existing `/forms` is an Outlet
  parent and `/forms/` is its index. A new nested organization configuration route
  must have a parent Outlet or use the router's non-nested route convention;
  simply nesting under the existing detail page can hide the child page.

Validation and state handling require more than delegating to `handleSubmit`:

- Installed TanStack Form source shows `validateAllFields('submit')` validates
  field-level validators only. Its submission path also calls `validate('submit')`
  for form-level validation and inspects validity. The participant adapter must
  cover both and await async validators without invoking the child's save.
- `handleSubmit()` can resolve without saving when a form is invalid; a resolved
  promise is not a successful write. Report explicit validation outcomes.
- `form.reset(values)` changes defaults and clears field metadata. Avoid calling
  it unconditionally on every query update. Preserve dirty data and associate
  baseline updates with the submission that actually succeeded.
- Capture the participant definitions, inputs, and context for each run. React
  rerenders, fresh callback identities, and query updates must not swap the active
  run's configuration. Promise resolution remains the source of request results,
  not polling a mutation hook's transient `data` or `isSuccess` state.

Cache and failure handling have known limits to address deliberately:

- The existing `createCacheReconciliation` replays updates within one run. It does
  not protect against arbitrary later background fetches or a separate form's
  stale refetch. A five-second `staleTime` does not block explicit refetches.
  The new ordering guarantee covers the coordinated refresh phase; test subsequent
  navigation/fetch behavior and document any remaining consistency limit. Do not
  claim globally monotonic reads without a separate version-aware strategy.
- `upsertBootstrap` compares `updatedAt` only against currently cached records.
  Once a stale fetch replaces the cache, records lost from it cannot be recovered
  by merging only the latest response. List/detail projection policies need
  explicit coverage, especially when two children contribute to one summary.
- Existing `useSaveFlow` records completed steps after refetch/effects and has
  compensation callbacks. A failure after a successful write can therefore omit
  that write from its completed list. The new executor must record persistence
  immediately and distinguish follow-up failures; do not automatically transfer
  the legacy compensation behavior into the new ordered form runner.
- The current HTTP helper throws a plain Error containing response text. Reliable
  retry classification needs a structured domain/API error retaining HTTP status;
  do not parse error-message strings to decide whether a write is retryable.
- Clear-all currently cancels and resets only the bootstrap query, and its disabled
  state watches active mutations. Resource-specific caches and an orchestrator's
  post-request lifecycle extend that surface. Update clear-all coordination so
  pending reconciliation cannot reinsert deleted data after clear-all completes.
- UI feedback should report partial saves truthfully. A successful Profile write
  is still persisted when Operations fails. Avoid notifications that imply rollback
  or promise safe repetition of non-idempotent creates.

Testing and verification specifics:

- The existing tests cover only the small reconciliation helper with QueryClient,
  not mounted form hooks, validation, retries, endpoint behavior, or the full flow.
- Root `tsconfig.json` includes `src` and `vite.config.ts`, not `tests`. Node's
  TypeScript stripping does not typecheck test files. Add a dedicated type-test
  configuration or otherwise include compile-time fixtures explicitly so
  `@ts-expect-error` inference tests are actually verified.
- Use `.ts` imports where needed for direct Node ESM tests, as the existing test
  does. Keep a React-free executor importable without loading TSX field components.
- If adding mounted-hook tests, choose a small non-browser test harness and
  document its purpose. The user declined Playwright, not focused automated logic
  or hook tests. Test API handlers in isolated state, not by clearing a running
  user workspace to prepare test data.
- Vite builds may regenerate route artifacts. Inspect those diffs before closing
  each jj revision. Monaco produces large-chunk warnings in existing builds;
  distinguish these from new compilation failures. Do not rebuild the ty WASM
  toolchain unless needed by the existing scripts.

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
