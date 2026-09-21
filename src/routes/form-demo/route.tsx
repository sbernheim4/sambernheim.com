import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Shell } from "./components/-Layout";

const FormDemoLayout = () => {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
};

export const Route = createFileRoute("/form-demo")({
  component: FormDemoLayout,
});
