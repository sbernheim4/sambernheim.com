import { useState } from "react";
import { Form, useFormContext } from "../../../../forms/components/FormComponents";
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
  const [saved, setSaved] = useState(false);
  const editor = useProjectForm({
    resource,
    organizationId,
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
      <ProjectFormFields />
    </Form.Single>
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
