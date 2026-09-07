import { useState } from "react";
import { Form, useFormContext } from "../../../../forms/components/FormComponents";
import type { Organization } from "../../types";
import { regionOptions, sectorOptions, statusOptions } from "../fieldOptions";
import { useOrganizationForm } from "../hooks/useOrganizationForm";
export const OrganizationForm = ({
  resource,
  onCreated,
}: {
  resource?: Organization;
  onCreated?: () => void;
}) => {
  const [saved, setSaved] = useState(false);
  const editor = useOrganizationForm({
    resource,
    onSuccess: () => {
      setSaved(true);
      if (!resource) {
        onCreated?.();
      }
    },
  });

  return (
    <Form.Single
      value={{
        ...editor,
        onChange: () => {
          return setSaved(false);
        },
      }}
      saveLabel={resource ? "Save changes" : "Create"}
      saved={saved}
    >
      <OrganizationFormFields />
    </Form.Single>
  );
};
export const OrganizationFormFields = ({
  onNameChange,
}: {
  onNameChange?: (value: string) => void;
} = {}) => {
  const typedForm = useFormContext<ReturnType<typeof useOrganizationForm>["form"]>("organization");

  return (
    <>
      <typedForm.AppField name="name">
        {(field) => {
          return <field.TextField label="Organization name" required onChange={onNameChange} />;
        }}
      </typedForm.AppField>
      <typedForm.AppField name="sector">
        {(field) => {
          return <field.SelectField label="Sector" options={sectorOptions} />;
        }}
      </typedForm.AppField>
      <typedForm.AppField name="status">
        {(field) => {
          return <field.RadioGroupField label="Status" options={statusOptions} />;
        }}
      </typedForm.AppField>
      <typedForm.AppField name="region">
        {(field) => {
          return <field.SelectField label="Region" options={regionOptions} />;
        }}
      </typedForm.AppField>
    </>
  );
};
