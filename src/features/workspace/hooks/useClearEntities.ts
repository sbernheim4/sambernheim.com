import { useSyncExternalStore } from "react";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { useClearWorkspaceMutation } from "./mutations";
import { getSaveGuard } from "../../../forms/orchestration/orchestrator";
import { clearWorkspace } from "../clearWorkspace";

export function useClearEntities() {
  const queryClient = useQueryClient();
  const activeMutations = useIsMutating();
  const saveGuard = getSaveGuard(queryClient);
  const activeSaves = useSyncExternalStore(
    saveGuard.subscribe,
    saveGuard.getSnapshot,
    saveGuard.getSnapshot,
  );
  const mutation = useClearWorkspaceMutation();
  return {
    ...mutation,
    isDisabled: activeMutations > 0 || activeSaves > 0,
    clear: () => {
      void clearWorkspace(queryClient, mutation.mutateAsync).catch(() => {});
    },
  };
}
