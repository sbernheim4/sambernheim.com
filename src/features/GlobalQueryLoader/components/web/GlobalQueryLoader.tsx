import { useGlobalQueryLoaderModel } from "../../model";
import "./GlobalQueryLoader.css";

export const GlobalQueryLoader = () => {
  const { visible } = useGlobalQueryLoaderModel();

  if (!visible) {
    return null;
  }

  return (
    <div className="global-query-loader" role="status" aria-label="Loading">
      <span className="global-query-loader-spinner" aria-hidden="true" />
      <span>Loading</span>
    </div>
  );
};
