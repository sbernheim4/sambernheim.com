import { createFileRoute, Outlet } from "@tanstack/react-router";
const FormsLayout = () => {
  return (
    <div className="forms-route">
      <Outlet />
    </div>
  );
};

export const Route = createFileRoute("/forms")({
  ssr: false,
  component: FormsLayout,
});
