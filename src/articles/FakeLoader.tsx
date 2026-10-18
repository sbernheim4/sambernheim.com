import { useIsFetching, useQuery } from "@tanstack/react-query";

import "./FakeLoader.css";

export const FakeLoader = () => {
  const fakeQuery = useQuery({
    queryKey: ["ux-demo"],
    queryFn: () => {
      return new Promise((res) => {
        setTimeout(() => {
          res("DONE");
        }, 3000);
      });
    },
    enabled: false,
  });

  return (
    <button type="button" disabled={fakeQuery.isFetching} onClick={() => void fakeQuery.refetch()}>
      {fakeQuery.isFetching ? "Loading..." : "Click me to fire a refetch"}
    </button>
  );
};

export const FakeGlobalQueryLoader = () => {
  const isFetching = useIsFetching() > 0;

  if (!isFetching) {
    return null;
  }

  return (
    <div className="fake-global-query-loader" role="status" aria-label="Loading">
      <span className="fake-global-query-loader-spinner" aria-hidden="true" />
      <span>Loading</span>
    </div>
  );
};
