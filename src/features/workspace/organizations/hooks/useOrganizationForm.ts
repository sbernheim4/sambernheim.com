import { useQueryBackedForm } from "../../../../forms/hooks/useQueryBackedForm";
import type { OutcomeCallbacks } from "../../../../forms/orchestration/types";
import { organizationCacheUpdates } from "../../cachePolicies";
import { workspaceKeys } from "../../queries";
import type { Organization, SaveOrganizationInput, SaveOrganizationResponse } from "../../types";
import { regionOptions, sectorOptions, statusOptions } from "../fieldOptions";
import { option } from "../../formOptions";
import { useCreateOrganization, useUpdateOrganization } from "./mutations";
import { useOrganization } from "./queries";
export type OrganizationFormValues = Pick<Organization, "name" | "sector" | "status" | "region">;

const defaultValues: OrganizationFormValues = {
  name: "",
  sector: "healthcare",
  status: "active",
  region: "east",
};

export function useOrganizationForm({
  resource,
  ...callbacks
}: { resource?: Organization } & OutcomeCallbacks<
  OrganizationFormValues,
  SaveOrganizationInput,
  SaveOrganizationResponse
>) {
  const query = useOrganization(resource?.id ?? "");
  const create = useCreateOrganization();
  const update = useUpdateOrganization(resource?.id ?? "");
  const form = useQueryBackedForm({
    query: resource ? query : undefined,
    defaultValues,
    toFormData: (data: Organization): OrganizationFormValues => ({
      name: data.name,
      sector: data.sector,
      status: data.status,
      region: data.region,
    }),
    toMutationPayload: (values): SaveOrganizationInput => ({
      name: values.name.trim(),
      sector: option(values.sector, sectorOptions),
      status: option(values.status, statusOptions),
      region: option(values.region, regionOptions),
    }),
    validate: (values) => (!values.name?.trim() ? "Organization name is required." : undefined),
    endpoint: {
      mutationFn: resource ? update.mutateAsync : create.mutateAsync,
      retrySafe: !!resource,
    },
    invalidateQueryKeys: [workspaceKeys.all],
    cacheUpdates: organizationCacheUpdates(),
    ...callbacks,
  });
  return form;
}
