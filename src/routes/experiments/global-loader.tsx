import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const GlobalLoaderDemo = () => {
  const [enabled, setEnabled] = useState(false);
  const request = useQuery({
    queryKey: ["experiments", "global-loader", enabled],
    enabled,
    queryFn: async () => {
      await new Promise((resolve) => {
        return setTimeout(resolve, 1800);
      });
      return { updatedAt: new Date() };
    },
    staleTime: 0,
  });
  return (
    <section className="playground-page">
      <header className="playground-heading">
        <h1>A global loading indicator</h1>
        <p>
          The site watches the TanStack Query’s shared fetching state. A loading indicator shows in
          the top right corner whenever data is loading.
        </p>
      </header>

      <div className="forms-playground-card">
        <button
          type="button"
          onClick={() => {
            setEnabled(false);
            request.refetch();
          }}
        >
          Start a fetch
        </button>
      </div>
    </section>
  );
};

export const Route = createFileRoute("/experiments/global-loader")({
  head: () => {
    return { meta: [{ title: "Global query loader — Samuel Bernheim" }] };
  },
  component: GlobalLoaderDemo,
});
