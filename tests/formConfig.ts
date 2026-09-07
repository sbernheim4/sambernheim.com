import type { AnyForm, AsyncMutation, FormConfig } from "../src/forms/orchestration/types";
export const defineForm = <
  const Id extends string,
  V,
  M extends AsyncMutation,
  const D extends readonly AnyForm[] = readonly [],
>(
  config: FormConfig<Id, V, M, D>,
) => {
  return config;
};
