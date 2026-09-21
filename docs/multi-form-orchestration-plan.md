# Complete the Declarative Form Orchestration Refactor

## Summary

Finish the refactor so plan compilation, scheduling, runtime state, mutation behavior, effects, and pipeline composition each have one clear owner. Preserve `createOrchestrator` behavior, save/undo ordering, callback semantics, and existing public imports.

Node failures must become failed runtime states. Infrastructure and scheduler errors must never be silently swallowed.

## Key implementation changes

### 1. Mode-aware save plans

Update `plan.ts`:

```ts
type SaveNode = {
  id: string;
  form: FormInput;
  prerequisites: readonly string[];
  dependents: readonly string[];

  /** @deprecated Normal declared dependencies, retained for compatibility. */
  dependencies: readonly string[];
};

type SavePlan = {
  nodes: ReadonlyMap<string, SaveNode>;
  order: readonly string[];
  mode: "save" | "undo";
};
```

`compileSavePlan(forms, mode = "save")` will:

- Validate duplicate IDs, missing dependencies, self-dependencies, and cycles.
- Return `{ plan: undefined, errors }` when validation fails.
- Calculate dependents once in declaration order.
- Use declared dependencies as prerequisites for `"save"`.
- Use dependents as prerequisites for `"undo"`.
- Preserve input declaration order in `order`.
- Retain the old one-argument call as `"save"` for compatibility.

`orchestrator.ts` will determine the mode from `config.undoPayloads !== undefined`, compile the plan before snapshotting or invoking any user code, and reject with the existing `AggregateError` without creating a pipeline when no plan is available.

### 2. Generic scheduler contract

Refactor `executeGraph` so it operates only on generic runnable nodes:

```ts
type RunnableNode<T> = {
  id: string;
  prerequisites: readonly string[];
  run: () => Promise<T>;
};
```

The scheduler will own:

- Stable input-order scheduling.
- Prerequisite readiness.
- Bounded concurrency.
- Failed-node propagation.
- Skipped-node propagation with blocking IDs.
- Explicit started/completed/failed/skipped events.
- Deterministic result collection.

Use an explicit result union so values cannot be confused with failures:

```ts
type NodeResult<T> =
  | { status: "completed"; value: T }
  | { status: "failed"; error: unknown }
  | { status: "skipped"; blockedBy: readonly string[] };
```

Node execution errors become failed results and events. Scheduler invariant failures, invalid graph structure, invalid concurrency configuration, and event-handler exceptions reject the scheduler promise and are never swallowed.

Concurrency rules:

- `undefined` and `Infinity` mean unlimited concurrency.
- Finite values are floored and clamped to at least one worker.
- `NaN` is treated as one worker for backward compatibility.
- Results are returned in node declaration order regardless of completion order.

Move form behavior into a separate form-specific adapter. It will create runnable nodes with resolved variables, retry policy, and mutation execution, then translate scheduler events into runtime events.

### 3. Authoritative runtime state

Keep one runtime model in `state.ts`:

```ts
type RuntimeState = {
  forms: FormStates;
  responses: Responses;
  followUpErrors: readonly FollowUpError[];
};
```

All form and follow-up changes will use `reduceRuntimeState` or a small runtime dispatcher. The reducer owns:

- Ready, saving, retrying, saved, failed, and skipped transitions.
- Failure phase and metadata.
- Response recording.
- Skipped-node `blockedBy` metadata.
- Follow-up error accumulation.
- Immutable updates.

Unknown form IDs and invalid runtime events are programmer errors and must throw rather than silently creating incomplete state.

Remove direct runtime mutation from scheduler and pipeline callbacks. Scheduler events only enter the form adapter, and effect executor outcomes only enter the runtime through follow-up failure events.

### 4. Isolated mutation behavior

Keep `mutation.ts` responsible for:

- Retry policy precedence and resolution.
- Transient-error detection.
- Retry limits.
- Delay calculation.
- Mutation invocation.
- Mutation progress events.

Retry predicate failures and delay-calculation failures must produce failed mutation results with the policy error preserved as the failure cause. They must not be silently converted to success or discarded.

The scheduler will contain no retry or form-specific logic.

### 5. Effect descriptors and executors

Refactor `effects.ts` around descriptors containing effect metadata:

```ts
type Effect = {
  phase: "refresh" | "cache" | "form-state" | "effect";
  formId?: string;
  run: () => unknown | Promise<unknown>;
};
```

Provide builders for:

- Query invalidation.
- Refetch functions.
- Form cache updates.
- Group cache updates.
- Form success/failure callbacks.
- Group success/failure callbacks.
- Mark-saved actions.
- Finish actions.

Provide dedicated executors with these guarantees:

- Refresh effects are settled independently; one failure does not stop later refreshes.
- Cache effects continue after individual failures.
- Callback effects run in deterministic declaration order.
- Partial saves invoke the appropriate failure callbacks.
- Every rejected effect becomes a typed `FollowUpError`.
- Ordering remains:

```text
refresh → reconcile → mark saved → callbacks → finish
```

The runtime’s follow-up error list is the sole source for the final result.

### 6. Pipeline and orchestrator composition

Reduce `pipeline.ts` to:

- Runtime creation.
- Ordered stage declarations.
- Stage execution.
- Final result projection.

Keep the stage order:

```text
snapshot
→ validate
→ prepare payloads
→ save
→ finalize
→ refresh
→ reconcile
→ mark saved
→ effects
→ complete
```

Replace the large `PipelineOperations` object with focused stage dependencies or module imports. Node failures and expected effect failures become result state; unexpected stage or infrastructure errors reject the submit promise and are not swallowed.

Keep `orchestrator.ts` limited to:

- Active-submit coalescing.
- Mode selection and plan compilation.
- Pipeline invocation.
- Reset behavior.
- `onChange` wiring.

## Test plan

Add focused tests for:

- `plan.ts`: duplicate IDs, missing dependencies, self-dependencies, cycles, no executable plan on errors, save prerequisites, undo prerequisites, declaration ordering, and compatibility call signature.
- `state.ts`: every transition, response recording, failure metadata, skipped metadata, immutable updates, unknown-ID errors, and follow-up accumulation.
- `scheduler.ts`: independent parallel nodes, prerequisite waiting, max concurrency, failed-node propagation, skipped descendants, thrown node errors, scheduler invariant errors, event-handler errors, invalid concurrency, and deterministic results.
- `mutation.ts`: retry-safe and non-retry-safe endpoints, retry limits, retry predicate failures, delay calculation failures, and progress event ordering.
- `effects.ts`: independent refresh failures, continuing cache updates, ordered callbacks, partial-save behavior, effect metadata, and follow-up conversion.
- Integration: snapshot timing, payload mapping timing, undo order, progress phase ordering, active-submit coalescing, reset behavior, stage rejection, and final outcome projection.

Run:

```text
npm run lint
npm run typecheck
npm run typecheck:tests
npm test
```

Do not modify unrelated workspace test additions. The current baseline includes an unrelated `DetailTabs` test failure and unrelated `forms-components` test type errors; these should be reported separately unless the implementation changes their behavior.

## Assumptions and compatibility decisions

- `createOrchestrator` remains the primary public API and retains its current promise behavior.
- `compileSavePlan(forms)` remains valid and defaults to normal save mode.
- `SaveNode.dependencies` remains as a deprecated compatibility alias for declared dependencies; new internal scheduling uses `prerequisites`.
- Invalid plans reject before snapshots, undo capture, validation, mutation, or other user callbacks.
- Expected form/mutation failures produce normal `SaveResult` values; unexpected scheduler or pipeline failures reject the submit promise.
- Existing save semantics, undo semantics, callback ordering, and known deprecation warning remain unchanged.
