# Multi-Form Orchestration — Optional Follow-up

- Compare an Effect-based execution layer with the current promise-based
  orchestrator before adopting it. Prototype the boundary in isolation and
  evaluate its dependency and abstraction cost.
- If that prototype is useful, explore retry schedules, backoff, timeouts,
  cancellation, and bounded concurrency while preserving the public promise API.
  Connect interruption to an `AbortSignal` so it also cancels the network request.
