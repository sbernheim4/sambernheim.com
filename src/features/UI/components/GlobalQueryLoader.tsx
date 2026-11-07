import { useIsFetching } from "@tanstack/react-query";
import "./GlobalQueryLoader.css";

export const GlobalQueryLoader = () => {
  const isFetching = useIsFetching() > 0;

  if (!isFetching) {
    return null;
  }

  return (
    <div className="global-query-loader" role="status" aria-label="Loading">
      <span className="global-query-loader-spinner" aria-hidden="true" />
      <span>Loading</span>
    </div>
  );
};
