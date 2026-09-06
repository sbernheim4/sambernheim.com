import { useMutation } from "@tanstack/react-query";
import * as api from "../api";
import { workspaceKeys } from "../queries";
export const useClearWorkspaceMutation = () =>
  useMutation({
    mutationKey: [...workspaceKeys.all, "clear"],
    mutationFn: api.clearEntities,
    retry: false,
  });
