# Form Boundaries

`src/forms` contains reusable form infrastructure. It must not import workspace
entities, API clients, routes, or feature components.

- `types.ts`: contracts for saves, refetch policies, cache updates, and effects.
- `query/`: UI-independent mutation hooks and query orchestration. These modules
  may perform effects through QueryClient; they are not pure functions.
- `context.ts`: shared TanStack Form contexts.
- `ui/`: field rendering and interaction. No endpoint or domain knowledge.
- `bindings/`: the explicit composition layer connecting registered UI fields,
  TanStack Form, and the independent save hooks. `useQueryBackedForm` is the
  single-endpoint adapter; `useFlowForm` is the dependent-flow adapter.

Dependency direction:

```text
Feature views -> form bindings -> query hooks -> query effects
                      |
                      v
                 registered UI -> form contexts
```

Domain code lives in `src/features/workspace`:

- `types.ts` and `fieldOptions.ts`: domain contracts and option data.
- `cache.ts`: pure, immutable cache transforms; no React, QueryClient, or I/O.
- `api.ts`: HTTP requests.
- `queries.ts`: query keys. Existing key values are retained for cache continuity.
- `hooks/`: workspace query and mutation state.
- `components/`: workspace rendering and form composition.

The form-demo activity panel lives in `src/features/form-demos`.
Routes import these modules directly, without compatibility re-export files.

Save ordering remains refetch completion, authoritative cache reconciliation,
then after-effects. Keep refetches in the refetch policy rather than after-effects.
