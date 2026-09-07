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

1. Add a site component area with the navbar, landing page, About section, and scoped styles.
2. Add TanStack routes for the landing page, blog index, article details, and math demo.
3. Audit dependencies and add only the focused MDX/GFM/highlighting packages needed for the article experience; remove `excoptional`-style indirection.
4. Add an MDX build path for the existing article files and replace Remix loader data with typed route data.
5. Replace Remix navigation, location, action, and loader APIs with TanStack Router state and a local mutation for the math demo.
6. Update the root document metadata and navigation without affecting workspace layouts.
7. Run lint, formatting, typecheck, and route smoke checks for both the existing workspace and the ported site.
