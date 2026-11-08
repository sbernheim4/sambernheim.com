import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Shell } from "@features/Workspace/components/web/Layout/Layout";
import { WorkspaceRendererContext } from "@features/Workspace/components/renderer";
import { webWorkspaceRenderer } from "@features/Workspace/components/web/renderer";
import { FieldPrimitivesContext } from "@features/Forms/components/fields";
import { webFieldPrimitives } from "@features/Forms/components/fields/web";

const FormDemoLayout = () => {
  return (
    <FieldPrimitivesContext.Provider value={webFieldPrimitives}>
      <WorkspaceRendererContext.Provider value={webWorkspaceRenderer}>
        <Shell>
          <Outlet />
        </Shell>
      </WorkspaceRendererContext.Provider>
    </FieldPrimitivesContext.Provider>
  );
};

export const Route = createFileRoute("/form-demo")({
  component: FormDemoLayout,
});
