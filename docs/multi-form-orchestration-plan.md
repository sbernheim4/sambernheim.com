# Multi-Form Orchestration — Next Steps

The implementation is complete. Remaining work is optional follow-up:

1. Perform manual browser verification of the organization detail page:
   - edit Profile and Operations fields;
   - confirm the single Save button becomes active;
   - confirm the compound `Form.SaveButton` and `Form.DiscardButton` respond
     to the aggregate form state;
   - save one or both forms and navigate away/back;
   - verify saved values persist and partial failures preserve unsaved edits.
     Also verify `/forms/flow` uses the same compound controls and shared entity
     field renderers while preserving ordered Organization → Project → Task saves.
2. Explore an Effect-based execution layer later. Keep the public API promise
   based, lift `mutationFn` with `Effect.tryPromise`, apply retry schedules,
   backoff, timeouts, interruption/cancellation, and bounded concurrency, then
   return the result with `Effect.runPromise`. Connect interruption to an
   `AbortSignal` so canceling the Effect also cancels the network request.
3. Before adopting Effect, compare its dependency and abstraction cost with the
   current orchestrator and prototype the boundary in isolation.
