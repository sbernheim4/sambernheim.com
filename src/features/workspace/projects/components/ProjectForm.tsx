import { Form, useFormContext } from "../../../../forms/components/FormComponents";
import { FormEditor } from "../../../../forms/components";
import type { Project } from "../../types";
import { budgetOptions, phaseOptions, priorityOptions } from "../fieldOptions";
import { useProjectForm } from "../hooks/useProjectForm";

export const ProjectForm = ({
  resource,
  organizationId,
  onCreated,
  onDiscard,
}: {
  resource?: Project;
  organizationId: string;
  onCreated?: () => void;
  onDiscard?: () => void;
}) => {
  const editor = useProjectForm({
    resource,
    organizationId,
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
        forms: { project: editor.form },
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
                  <h2>{resource ? "Edit project" : "Create project"}</h2>
                  <p>Project details</p>
                </div>
                <FormEditor.Actions />
              </div>
            </FormEditor.Header>
            <FormEditor.Error />
            <FormEditor.Content>
              <FormEditor.Tab name="details">
                <Form.Fields>
                  <ProjectFormFields />
                </Form.Fields>
              </FormEditor.Tab>
            </FormEditor.Content>
          </FormEditor.Main>
        </FormEditor.Layout>
      </FormEditor.Provider>
    </Form.Provider>
  );
};

export const ProjectFormFields = () => {
  const typedForm = useFormContext<ReturnType<typeof useProjectForm>["form"]>("project");

  return (
    <>
      <typedForm.AppField name="name">
        {(field) => {
          return <field.TextField label="Project name" required />;
        }}
      </typedForm.AppField>
      <typedForm.AppField name="priority">
        {(field) => {
          return <field.RadioGroupField label="Priority" options={priorityOptions} />;
        }}
      </typedForm.AppField>
      <typedForm.AppField name="phase">
        {(field) => {
          return <field.SelectField label="Phase" options={phaseOptions} />;
        }}
      </typedForm.AppField>
      <typedForm.AppField name="budget">
        {(field) => {
          return <field.SelectField label="Budget" options={budgetOptions} />;
        }}
      </typedForm.AppField>
    </>
  );
};
