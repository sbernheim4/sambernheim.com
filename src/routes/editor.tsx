import { createFileRoute, Link } from "@tanstack/react-router";

import { PythonEditor } from "../features/editor/components/PythonEditor";

export const Route = createFileRoute("/editor")({
  ssr: false,
  component: EditorRoute,
});

function EditorRoute() {
  return (
    <div className="editor-route-shell">
      <Link to="/" className="editor-home-link">
        Home
      </Link>
      <PythonEditor />
    </div>
  );
}
