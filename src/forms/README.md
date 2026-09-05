# Form boundaries

`src/forms` must not import workspace entities, HTTP clients, routes, feature
components, or notification libraries.

- `orchestration/contracts.ts` defines typed participants, mappings, cache targets,
  outcomes, callbacks and retry policies. `createParticipant` retains inference
  from a promise-returning mutation, including TanStack `mutateAsync`.
- `orchestration/executor.ts` runs independently of React and TanStack Form.
  `lifecycle.ts` settles refreshes and applies cache targets. `coordinator.ts`
  tracks complete lifecycles per QueryClient so clear-all can exclude them.
- `query/useFormOrchestrator.ts` exposes submit, reset, phase, saving state,
  participant progress and a structured result to React.
- `bindings/useComposableForm.ts` initializes a registered form from a domain
  query and defines its participant. It does not submit the form itself.
- `bindings/useQueryBackedForm.ts` provides the one-resource CRUD facade through
  that binding and a one-participant orchestrator. Call `submit()` for the result;
  `form.handleSubmit()` remains available for existing form components.
- `bindings/formAdapter.ts` validates detached TanStack Form/Field snapshots,
  awaits both field and form validators, and copies errors to unchanged fields.
  It accepts saved baselines without overwriting edits made after submission.
- `context.ts`, `bindings/useAppForm.ts`, and `ui/` register and render fields.
  Only this binding/UI layer knows about field components.
- `useSaveFlow` / `useFlowForm` retain dependent endpoint workflows through the
  shared executor and `orchestration/flowAdapter.ts`. A flow's input builders and
  context assignments must be synchronous, pure functions. Explicit legacy
  compensation callbacks remain confined to that adapter and never run because
  a refresh or outcome callback failed.

Domain query/mutation/form hooks live in `src/features/workspace/hooks`. Views
render their forms. Request hooks own URLs, mutation keys and `retry: false`;
form hooks pass their `mutateAsync` directly as `endpoint.mutationFn`. Do not wrap
it in another mutation, put lifecycle effects in mutation callbacks, or watch
transient mutation `data`/`isSuccess` to infer a response. Aggregate saving lasts
through refresh, cache updates, baselines and callbacks. The application's
QueryClient has no global mutation callbacks that interfere with this ordering.

## Composition

```tsx
const profile = useOrganizationProfileForm({ organizationId })
const operations = useOrganizationOperationsForm({ organizationId })
const save = useFormOrchestrator({
  forms: [profile.participant, operations.participant],
  retry: { maxRetries: 1, delayMs: 500 },
  onSuccess: ({ result }) => reportSaved(result),
  onFailure: ({ result }) => reportFailure(result),
})
// Render one outer <form>, disable its fieldset while saving or not ready,
// and call save.submit() from its submit handler.
```

The simple facade accepts a domain query (including its selected data), optional
`toFormData`, optional `toMutationPayload`, and an endpoint. Mappers can be omitted
only across identity-compatible boundaries. Default-values mode supports creates
without a read query. Query-to-form mapping never receives loading `undefined`.
Background query changes do not replace dirty values. A save accepts the submitted
form-shaped values as its new baseline; normalized API fields only enter through
an explicit mapping of compatible query data. Later edits remain dirty.

For response-dependent participants, declare `dependencies: [earlier.participant]`
and use the typed `results` argument of `toMutationPayload`. Dependencies must
precede the child in the ordered forms list. Independent payloads are mapped
before any writes; dependent payloads are mapped immediately before that child's
request. A mapped input is calculated once and retained across retries.

## Lifecycle and results

1. Capture all participant definitions and form values. Validate every snapshot.
   Validation or independent mapping failures prevent all writes.
2. Save in declared order. Record each acknowledged response immediately. Retry
   only retry-safe endpoints for qualifying errors; stop and skip remaining
   children when a write or dependent mapping fails.
3. Run successful children's and group `refetchFunctions` and
   `invalidateQueryKeys`. Await all operations, including rejected operations and
   refetches started by invalidation, before injecting any responses.
4. Apply child cache targets in order, then group targets. Each target uses a
   functional `queryKey` and either `getData`/identity replacement or an advanced
   `(previous, context) => next` updater. `undefined` means no cache update.
   A failed target does not prevent subsequent targets.
5. Accept successful forms' submitted baselines. Failed and skipped forms keep
   their edits.
6. Await child outcomes in order, then the group outcome. Successful children
   receive `onSuccess` even on partial saves. Failed children receive `onFailure`
   once, after retries; skipped children receive neither. Callback failures are
   collected without retrying writes or recursively invoking failure callbacks.

Results distinguish `validation-failed`, `success`, `partial-failure`, and
`saved-with-follow-up-errors`. Participant states retain IDs, attempts, submitted
values, mapped variables, responses and validation/mapping/save errors. Refresh,
cache, baseline and callback errors live in `followUpErrors`. Group success means
all writes succeeded, even if a follow-up failed. Do not recommend repeating
successful creates after a follow-up error. There is no cross-endpoint atomicity
or implicit rollback. A second submit on a busy orchestrator returns its active
promise; duplicate IDs or invalid dependency order reject before writing.

Retries default to one retry after the initial attempt, with a 500 ms delay.
Only endpoints explicitly declaring `retrySafe: true` can retry. The default
predicate recognizes network `TypeError`s and structured HTTP status 408, 429,
and 5xx errors. Domain `ApiError` preserves HTTP status. Permanent client errors
are not retried; creates have no automatic retries without idempotency support.
A child's policy overrides group defaults. Each custom refresh must return its
promise; fire-and-forget work cannot be coordinated.

Legacy static cache keys, `refetchPolicy`, and `afterEffects` are accepted only at
compatibility adapters. Mixing effect arrays with outcome callbacks is rejected.
Workspace consumers use the new callback and flat refresh APIs. The original
`useSaveEndpoint` remains a legacy request/effect helper; modern form consumers
use the facade or participants instead.

## Workspace replica and clear-all policy

The example API maintains parent organization IDs plus one Profile and one
Operations record per organization. Name/sector belong to Profile; status/region
belong to Operations. Organization responses project both. Legacy organization
writes delegate to the child owners. Creation initializes both children; clear-all
removes them. API handler factories make tests independent of the user's server.

Child save policies inject the detail resource and merge owned fields into every
organization summary. Workspace queries preserve acknowledged versions on later
replica reads, including missing list entries. Separate Profile/Operations version
timestamps prevent one child's version from hiding stale fields from the other.
A replica 404 can use an existing cached resource, so immediate navigation after
creation works. Clear-all resets active observers, removes inactive workspace
caches, and prevents pending lifecycles from reinserting deleted records.

This policy fits the demo's clear-all deletion model. It does not guarantee
monotonic reads across cache eviction, reloads, other clients, or external deletes.
If individual deletion or server rendering is introduced, revisit the version,
tombstone and QueryClient ownership policies. The API middleware remains
**development-only**; a production bundle does not validate production hosting.

## Verification and semantic tools

- `npm run typecheck` checks application code; `npm run typecheck:tests` also
  checks tests and negative inference fixtures in `tests/types`.
- `npm run test:forms` bundles TS/TSX tests with the existing esbuild tool and runs
  Node tests. The small react-test-renderer harness tests hooks without a browser;
  React/Query remain external so it uses the same runtime instances. The renderer
  currently emits an upstream deprecation notice.
- `npm run build` generates routes and checks the production bundle. Browser
  verification is performed by the user; no browser automation was added.
- `npm run tsserver -- references FILE LINE OFFSET` locates semantic references.
  Other commands are `rename` (rename locations), `definition`, `quickinfo`,
  `navto SEARCH`, and `diagnostics FILE...`. Line/offset positions are one-based.
  These use the installed TypeScript language server and add no server dependency.
