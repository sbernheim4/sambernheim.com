import { Form, useFormContext } from "../../../../forms/components/FormComponents";
import { FormEditor } from "../../../../forms/components";
import type { Organization } from "../../types";
import { regionOptions, sectorOptions, statusOptions } from "../fieldOptions";
import { useOrganizationForm } from "../hooks/useOrganizationForm";
export const OrganizationForm = ({
  resource,
  onCreated,
  onDiscard,
}: {
  resource?: Organization;
  onCreated?: () => void;
  onDiscard?: () => void;
}) => {
  const editor = useOrganizationForm({
    resource,
    onSuccess: () => {
      if (!resource) {
        onCreated?.();
      }
    },
  });

  return (
    <Form.Provider
      value={{
        form: { handleSubmit: editor.submit, reset: editor.reset },
        forms: { organization: editor.form },
        isReady: editor.isReady,
        isSaving: editor.isSaving,
        isDirty: editor.isDirty,
      }}
    >
      <FormEditor.Provider
        mode={resource ? "edit" : "create"}
        defaultTab="details"
        actions={editor.actions}
        saveLabel={resource ? "Save changes" : "Create"}
        onCancel={() => {
          editor.reset();
          onDiscard?.();
        }}
      >
        <FormEditor.Layout className="form-panel app-form-panel">
          <FormEditor.Main>
            <FormEditor.Header>
              <div className="panel-heading">
                <div>
                  <h2>{resource ? "Edit organization" : "Create organization"}</h2>
                  <p>Organization details</p>
                </div>
                <FormEditor.Actions />
              </div>
            </FormEditor.Header>
            <FormEditor.Error />
            <FormEditor.Content>
              <FormEditor.Tab name="details">
                <Form.Fields>
                  <OrganizationFormFields />
                </Form.Fields>
              </FormEditor.Tab>
            </FormEditor.Content>
          </FormEditor.Main>
        </FormEditor.Layout>
      </FormEditor.Provider>
    </Form.Provider>
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
