import { useState } from "react";
import { Form, useFormContext } from "../../../../forms/components/FormComponents";
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
  const [saved, setSaved] = useState(false);
  const editor = useTaskForm({
    resource,
    project,
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
        onDiscard,
      }}
      saveLabel={resource ? "Save changes" : "Create"}
      pristineLabel={resource ? "Stop editing" : "Go back"}
      saved={saved}
    >
      <TaskFormFields />
    </Form.Single>
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
