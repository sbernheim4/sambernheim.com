# Source organization

Group application code by feature, with hooks and components inside their owning
feature. Routes remain thin adapters around feature screens.

```text
src/
├── features/
│   ├── PythonEditor/
│   │   ├── components/web/PythonEditor.tsx
│   │   ├── hooks/useTyMonacoSession.ts
│   │   ├── lsp/                 # Python runtime and Monaco language providers
│   │   ├── wasm/ty/             # Generated Python analyzer package and build notes
│   │   └── monaco.ts            # Monaco loader and worker setup
│   ├── Dates/
│   │   ├── components/          # Cycleable date and date-time displays
│   │   └── hooks/               # Date display mode context
│   ├── Commands/                # Command palette and command-aware controls
│   ├── ExecutionProfiles/
│   ├── Processes/
│   ├── Tasks/
│   ├── Threads/
│   ├── Theme/                   # Theme context and persistence
│   ├── Site/                    # Site navigation and chrome
│   └── UI/                      # Generic visual primitives
│   ├── forms/
│   │   ├── components/
│   │   │   ├── editor/          # FormEditor compound components
│   │   │   └── fields/          # TanStack Form field primitives
│   │   ├── hooks/
│   │   └── orchestration/       # UI-independent saving and its types
│   ├── shared/                   # Shared domain contracts and in-memory API
│   │   ├── store.ts
│   │   └── types.ts
│   └── utils/date.ts            # Low-level date parsing helpers
├── routes/                    # Route declarations and page wiring
```

Use direct imports from the owning feature. Keep cross-feature composition in
screens and routes, while entity-specific queries, mutations, forms, fields,
and models stay with their entity feature.

## Local commands

Use Node 22.18 or newer to run the TypeScript scripts directly. Authored application
and tooling code uses `.ts`/`.tsx`; bundled tests and application output use `.js`.
`npm run build` creates the application output; `npm start` previews that build
with the same in-memory example API used during development. Preview is a local
verification server, not a production deployment configuration.

- `npm test` runs the test suite.
- `npm run check` runs lint, formatting checks, application/test/script typechecks,
  and the test suite.
- `npm run format` applies the repository formatting rules; `npm run format:check`
  checks them without writing files.
- `npm run lint` checks authored code with the pinned oxlint version.
