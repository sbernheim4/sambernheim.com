# Form boundaries

`src/forms` must not import workspace entities, HTTP clients, routes, feature
components, or notification libraries.

- `hooks/useComposableForm.ts` takes one typed configuration and returns the
  form with its save instructions. Defaults define the field types. Helpers
  resolve query data, protect edits, and validate values outside the hook body.
- `hooks/useQueryBackedForm.ts` adds standalone saving to that same form. `save()`
  and `submit()` return the save result; `result`, `isSaving`, and `error` expose
  feedback. `form.handleSubmit()` also enters the orchestrator.
- `hooks/useFormOrchestrator.ts` selects dirty forms and exposes save progress.
  It passes the form bindings directly to `createOrchestrator`; there is no
  participant wrapper or separate runtime form representation.
- `orchestration/orchestrator.ts` captures values, validates, saves in order,
  refreshes queries, updates caches, accepts saved values, and calls outcomes.
  Its local helpers also guard Clear All until the complete save has finished.
- `orchestration/types.ts` describes form configurations, endpoints, and results.
- `hooks/formState.ts` validates detached TanStack snapshots and accepts saved
  baselines without overwriting edits made during submission.
- `hooks/useAppForm.ts`, `context.ts`, and `ui/fields.tsx` register and render fields.

The execution path is:

```text
useQueryBackedForm (standalone convenience)
  ├─ useComposableForm → form values + save configuration
  └─ useFormOrchestrator → createOrchestrator
       validate → save → refresh → update caches → mark clean → callbacks
```

Composed pages call `useComposableForm` for each entity and pass those bindings
into one `useFormOrchestrator`. Both hooks have one typed definition; no overload
implementations or `useComposableFormImpl` remain.

Domain query/mutation/form hooks live in `src/features/workspace/hooks`. Views
render their forms. Request hooks own URLs, mutation keys and `retry: false`;
form hooks pass their `mutateAsync` directly as `endpoint.mutationFn`. Do not wrap
it in another mutation, put lifecycle effects in mutation callbacks, or watch
transient mutation `data`/`isSuccess` to infer a response. Aggregate saving lasts
through refresh, cache updates, baselines and callbacks. The application's
QueryClient has no global mutation callbacks that interfere with this ordering.

## Composition

```tsx
const profile = useOrganizationProfileForm({ organizationId });
const operations = useOrganizationOperationsForm({ organizationId });
const save = useFormOrchestrator({
  forms: [profile, operations],
  retry: { maxRetries: 1, delayMs: 500 },
  onSuccess: ({ result }) => reportSaved(result),
  onFailure: ({ result }) => reportFailure(result),
});
// Render one outer <form>, disable its fieldset while saving or not ready,
// and call save.submit() from its submit handler.
```

Each form requires typed `defaultValues` and accepts an optional domain query, optional
`toFormData`, optional `toMutationPayload`, and an endpoint. Mappers can be omitted
only across identity-compatible boundaries. Default-values mode supports creates
without a read query. Query-to-form mapping never receives loading `undefined`.
Background query changes do not replace dirty values. A save accepts the submitted
form-shaped values as its new baseline; normalized API fields only enter through
an explicit mapping of compatible query data. Later edits remain dirty.

For dependent saves, declare `dependencies: [earlierForm]`
and use the typed `results` argument of `toMutationPayload`. Dependencies must
precede the child in the ordered forms list. Independent payloads are mapped
before any writes; dependent payloads are mapped immediately before that child's
request. A mapped input is calculated once and retained across retries.

## Save sequence and results

1. Capture all form configurations and form values. Validate every snapshot.
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
`saved-with-follow-up-errors`. `result.forms` retains IDs, attempts, submitted
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

All form consumers use composable bindings and the shared orchestrator.
`useFormOrchestrator` accepts form bindings and saves only dirty forms by default;
`includePristine: true` includes unchanged defaults for creates. The standalone
`useQueryBackedForm` exposes `submit`, `save`, `isSaving`, and `error`, with
`form.handleSubmit` entering the same save executor.

The workspace launch demo uses three independent form bindings with typed
form dependencies to pass newly created organization/project IDs to later
saves. Its orchestrator sets `includePristine: true` so create defaults are saved
without requiring edits. There is no separate form-flow API.

## Workspace replica and clear-all policy

The example API maintains parent organization IDs plus one Profile and one
Operations record per organization. Name/sector belong to Profile; status/region
belong to Operations. Organization responses project both. Organization
writes delegate to the child owners. Creation initializes both children; clear-all
removes them. API handler factories make tests independent of the user's server.
Create endpoints require the full payload for a new record, while edit endpoints
accept partial bodies and keep missing fields unchanged.

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
