import { createFileRoute } from "@tanstack/react-router";
import { CommandLink as Link } from "../shared/components/CommandLink";

import { PythonEditor } from "../editor/components/PythonEditor";

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
