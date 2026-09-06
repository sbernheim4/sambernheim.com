import { useState } from "react";
import { Form, useFormContext } from "../../../../forms/components/FormComponents";
import type { Organization } from "../../types";
import { regionOptions, sectorOptions, statusOptions } from "../fieldOptions";
import { useOrganizationForm } from "../hooks/useOrganizationForm";
import { FormActions } from "../../components/FormActions";
import { SaveFeedback } from "../../components/SaveFeedback";
export function OrganizationForm({
  resource,
  onCreated,
}: {
  resource?: Organization;
  onCreated?: () => void;
}) {
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
    <Form.Provider value={{ ...editor, onChange: () => setSaved(false) }}>
      <Form.Shell>
        <Form.Fields>
          <OrganizationFormFields />
          <FormActions creating={!resource} />
        </Form.Fields>
        <Form.Feedback />
        <SaveFeedback visible={saved} />
      </Form.Shell>
    </Form.Provider>
  );
}

export function OrganizationFormFields() {
  const typedForm = useFormContext<ReturnType<typeof useOrganizationForm>["form"]>("organization");
  return (
    <>
      <typedForm.AppField name="name">
        {(field) => <field.TextField label="Organization name" required />}
      </typedForm.AppField>
      <typedForm.AppField name="sector">
        {(field) => <field.SelectField label="Sector" options={sectorOptions} />}
      </typedForm.AppField>
      <typedForm.AppField name="status">
        {(field) => <field.RadioGroupField label="Status" options={statusOptions} />}
      </typedForm.AppField>
      <typedForm.AppField name="region">
        {(field) => <field.SelectField label="Region" options={regionOptions} />}
      </typedForm.AppField>
    </>
  );
}
