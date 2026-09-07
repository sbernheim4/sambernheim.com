import { workspaceKey } from "../queryOptions";
import { useMutation } from "@tanstack/react-query";
import * as api from "../api";
export const useClearWorkspaceMutation = () =>
  useMutation({
    mutationKey: [...workspaceKey(), "clear"],
    mutationFn: api.clearEntities,
    retry: false,
  });
