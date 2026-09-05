import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  ssr: false,
  component: Home,
})

function Home() {
  return (
    <main className="home-shell">
      <header className="home-header">
        <h1>Monaco LSP Examples</h1>
        <p>
          Small routes for editor and form-flow experiments in this workspace.
        </p>
      </header>

      <section className="home-routes" aria-label="Example routes">
        <Link to="/editor" className="route-card">
          <span>Code Editor</span>
          <p>Monaco with ty WASM over a single in-memory Python file.</p>
        </Link>
        <Link to="/forms" className="route-card">
          <span>Forms Index</span>
          <p>
            A hub for the single-resource and dependent form examples.
          </p>
        </Link>
      </section>
    </main>
  )
}
