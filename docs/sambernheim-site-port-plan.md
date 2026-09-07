# Port sambernheim.com into the TanStack app

## Scope

- Preserve the existing workspace, editor, and form routes.
- Port the personal landing page and About section to the root route.
- Preserve `/blog`, `/blog/$slug`, and every existing article slug.
- Port the party math trick demo to `/the-party-math-trick-demo`.
- Remove the need for Remix and React Router APIs from the ported code.
- Keep the site navigation and article reading experience intact.
- Replace dated Remix-era helpers with focused Vite/TanStack integrations.

## Implementation steps

1. [x] Add a site component area with the navbar, landing page, About section, and scoped styles.
2. [x] Add TanStack routes for the landing page, blog index, article details, and math demo.
3. [x] Audit dependencies and add focused MDX/GFM/frontmatter packages; remove `excoptional`-style indirection.
4. [x] Add an MDX build path for the existing article files and replace Remix loader data with typed route data.
5. [x] Replace Remix navigation, location, action, and loader APIs with TanStack Router state and local math-demo state.
6. [x] Update the root landing page and navigation without affecting workspace routes.
7. [x] Run lint, formatting, typecheck, and production build checks.

## Follow-up

- Add richer article metadata and syntax highlighting themes as a separate visual polish pass.
- Add route smoke tests for the new blog and demo paths.
