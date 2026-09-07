import {
  organizationListsKey,
  organizationKey,
  organizationProfileKey,
  organizationOperationsKey,
} from "../queryOptions";
import { bootstrapKey } from "../../queryOptions";
import { useQueryBackedForm } from "../../../../forms/hooks/useQueryBackedForm";
import type { OutcomeCallbacks } from "../../../../forms/orchestration/types";
import type { Organization, SaveOrganizationInput, SaveOrganizationResponse } from "../../types";
import { useCreateOrganization, useUpdateOrganization } from "./mutations";
import { useOrganization } from "./queries";
export type OrganizationFormValues = Pick<Organization, "name" | "sector" | "status" | "region">;

const defaultValues: OrganizationFormValues = {
  name: "",
  sector: "healthcare",
  status: "active",
  region: "east",
};
export const useOrganizationForm = ({
  resource,
  ...callbacks
}: {
  resource?: Organization;
} & OutcomeCallbacks<OrganizationFormValues, SaveOrganizationInput, SaveOrganizationResponse>) => {
  const query = useOrganization(resource?.id ?? "");
  const create = useCreateOrganization();
  const update = useUpdateOrganization(resource?.id ?? "");
  const form = useQueryBackedForm({
    query: resource ? query : undefined,
    defaultValues,
    toFormData: (data: Organization): OrganizationFormValues => {
      return {
        name: data.name,
        sector: data.sector,
        status: data.status,
        region: data.region,
      };
    },
    toMutationPayload: (values): SaveOrganizationInput => {
      return {
        name: values.name.trim(),
        sector: values.sector,
        status: values.status,
        region: values.region,
      };
    },
    validate: (values) => {
      return !values.name?.trim() ? "Organization name is required." : undefined;
    },
    endpoint: {
      mutationFn: resource ? update.mutateAsync : create.mutateAsync,
      retrySafe: !!resource,
    },
    invalidateQueryKeys: [
      organizationListsKey(),
      bootstrapKey(),
      ...(resource
        ? [
            organizationKey(resource.id),
            organizationProfileKey(resource.id),
            organizationOperationsKey(resource.id),
          ]
        : []),
    ],
    ...callbacks,
  });
  return form;
};
