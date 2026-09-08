import { Form, useFormContext } from "../../../../forms/components/FormComponents";
import { FormEditor } from "../../../../forms/components";
import type { Project, Task } from "../../types";
import { dueWindowOptions, ownerOptions, taskStatusOptions } from "../fieldOptions";
import { useTaskForm } from "../hooks/useTaskForm";
export const TaskForm = ({
  resource,
  project,
  onCreated,
  onDiscard,
}: {
  resource?: Task;
  project: Project;
  onCreated?: () => void;
  onDiscard?: () => void;
}) => {
  const editor = useTaskForm({
    resource,
    project,
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
        forms: { task: editor.form },
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
                  <h2>{resource ? "Edit task" : "Create task"}</h2>
                  <p>Task details</p>
                </div>
                <FormEditor.Actions />
              </div>
            </FormEditor.Header>
            <FormEditor.Error />
            <FormEditor.Content>
              <FormEditor.Tab name="details">
                <Form.Fields>
                  <TaskFormFields />
                </Form.Fields>
              </FormEditor.Tab>
            </FormEditor.Content>
          </FormEditor.Main>
        </FormEditor.Layout>
      </FormEditor.Provider>
    </Form.Provider>
  );
};
export const TaskFormFields = () => {
  const typedForm = useFormContext<ReturnType<typeof useTaskForm>["form"]>("task");
  return (
    <>
      <typedForm.AppField name="title">
        {(field) => {
          return <field.TextField label="Task title" required />;
        }}
      </typedForm.AppField>
      <typedForm.AppField name="owner">
        {(field) => {
          return <field.SelectField label="Owner" options={ownerOptions} />;
        }}
      </typedForm.AppField>
      <typedForm.AppField name="status">
        {(field) => {
          return <field.RadioGroupField label="Status" options={taskStatusOptions} />;
        }}
      </typedForm.AppField>
      <typedForm.AppField name="dueWindow">
        {(field) => {
          return <field.SelectField label="Due" options={dueWindowOptions} />;
        }}
      </typedForm.AppField>
    </>
  );
};
