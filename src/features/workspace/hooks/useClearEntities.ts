import { useQueryClient } from "@tanstack/react-query";
import { clearWorkspace } from "../clearWorkspace";
import { useClearWorkspaceMutation } from "./useClearWorkspaceMutation";

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
