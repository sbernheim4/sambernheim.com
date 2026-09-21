import { Outlet, createFileRoute } from "@tanstack/react-router";
import { RuntimeShell } from "../../shared/components/RuntimeLayout";

const FormDemoLayout = () => {
  return (
    <RuntimeShell>
      <Outlet />
    </RuntimeShell>
  );
};

export const Route = createFileRoute("/form-demo")({
  component: FormDemoLayout,
});
