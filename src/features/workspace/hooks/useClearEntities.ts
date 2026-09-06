import { useQueryClient } from "@tanstack/react-query";
import { useClearWorkspaceMutation } from "./mutations";
import { clearWorkspace } from "../clearWorkspace";

export function useClearEntities() {
  const queryClient = useQueryClient();
  const mutation = useClearWorkspaceMutation();
  return {
    ...mutation,
    isDisabled: mutation.isPending,
    clear: () => {
      void clearWorkspace(queryClient, mutation.mutateAsync).catch(() => {});
    },
  };
}
