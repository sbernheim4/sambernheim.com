import { useEffect, useState } from "react";
import { X } from "lucide-react";

export const RefreshErrorBanner = ({
  isFetching,
  onRetry,
}: {
  isFetching: boolean;
  onRetry: () => Promise<unknown>;
}) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDismissed(true);
    }, 10_000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (dismissed) {
    return null;
  }

  return (
    <div className="workspace-refresh-banner" role="status">
      <p>Couldn’t refresh the latest data. Your edits are still here.</p>
      <button
        type="button"
        className="workspace-button"
        disabled={isFetching}
        onClick={() => {
          void onRetry();
        }}
      >
        {isFetching ? "Retrying…" : "Retry"}
      </button>
      <button
        type="button"
        className="workspace-refresh-dismiss"
        aria-label="Dismiss refresh message"
        onClick={() => {
          setDismissed(true);
        }}
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
};
