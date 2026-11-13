import { useIsFetching } from "@tanstack/react-query";

export const useGlobalQueryLoaderModel = () => {
  return { visible: useIsFetching() > 0 };
};
