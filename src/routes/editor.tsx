import { createFileRoute, Link } from "@tanstack/react-router";

import { PythonEditor } from "../features/editor/components/PythonEditor";
const EditorRoute = () => {
  return (
    <div className="editor-route-shell">
      <Link to="/" className="editor-home-link">
        Home
      </Link>
      <PythonEditor />
    </div>
  );
};
export const Route = createFileRoute("/editor")({
  ssr: false,
  component: EditorRoute,
});
