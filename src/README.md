# Source organization

Group application code by feature, with hooks and components inside their owning
feature. Shared form infrastructure stays independent of domain features.

```text
src/
├── features/
│   ├── editor/
│   │   ├── components/PythonEditor.tsx
│   │   ├── hooks/useTyMonacoSession.ts
│   │   ├── lsp/                 # Python runtime and Monaco language providers
│   │   └── monaco.ts           # Monaco loader and worker setup
│   ├── workspace/
│   │   ├── organizations/      # Includes Profile and Operations
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── fieldOptions.ts
│   │   ├── projects/           # Same entity structure
│   │   ├── tasks/              # Same entity structure
│   │   ├── components/         # Shared pages, layout, and controls
│   │   ├── hooks/              # Cross-entity reads, launch flow, and reset
│   │   └── *.ts                # Shared API, contracts, query keys, and cache logic
│   └── form-demos/             # Demo activity display
├── forms/
│   ├── components/            # Compound form controls and field primitives
│   ├── hooks/                 # Shared form bindings and React integration
│   ├── orchestration/         # UI-independent saving and its types
│   └── context.ts             # TanStack form and field contexts
├── routes/                    # Route declarations and page wiring
└── wasm/ty/                   # Generated Python analyzer package and build notes
```

Use direct imports from the owning module. Keep cross-entity composition at the
workspace level and entity-specific queries, mutations, forms, and fields with
the entity. The workspace API and cache reconciliation remain shared because
they handle related records and aggregate views across entities.

## Local commands

Use Node 22.18 or newer to run the TypeScript scripts directly. Authored application
and tooling code uses `.ts`/`.tsx`; bundled tests and application output use `.js`.
`npm run build` creates the application output; `npm start` previews that build
with the same in-memory example API used during development. Preview is a local
verification server, not a production deployment configuration.
