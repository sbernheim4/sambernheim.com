import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { WorkspaceQueryState } from "../queryState";
import { RefreshErrorBanner } from "./RefreshErrorBanner";

export const QueryState = ({
  query,
  missing,
  children,
}: {
  query: WorkspaceQueryState;
  missing?: boolean;
  children: ReactNode;
}) => {
  if (!query.hasData && query.isPending) {
    return (
      <p className="workspace-empty" role="status">
        Loading resources...
      </p>
    );
  }
  if (!query.hasData && query.isError) {
    return (
      <div className="workspace-empty" role="alert">
        <h2>Unable to load resources</h2>
        <p>Please try again.</p>
        <button
          type="button"
          className="workspace-button"
          onClick={() => {
            return void query.refetch();
          }}
        >
          Retry
        </button>
      </div>
    );
  }
  if (missing) {
    return (
      <div className="workspace-empty">
        <h2>Resource not found</h2>
        <p>This resource may have been removed.</p>
        <Link to="/organizations">Back to organizations</Link>
      </div>
    );
  }
  return (
    <>
      {query.isError && (
        <RefreshErrorBanner
          key={query.errorUpdatedAt}
          isFetching={query.isFetching}
          onRetry={query.refetch}
        />
      )}
      {children}
    </>
  );
};
