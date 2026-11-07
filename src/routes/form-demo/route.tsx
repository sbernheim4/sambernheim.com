import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Shell } from "@features/Workspace/components/web/Layout/Layout";
import { WorkspaceRendererContext } from "@features/Workspace/components/renderer";
import { webWorkspaceRenderer } from "@features/Workspace/components/web/renderer";

const FormDemoLayout = () => {
  return (
    <WorkspaceRendererContext.Provider value={webWorkspaceRenderer}>
      <Shell>
        <Outlet />
      </Shell>
    </WorkspaceRendererContext.Provider>
  );
};

export const Route = createFileRoute("/form-demo")({
  component: FormDemoLayout,
});
