import { useState } from "react";
import { Form, useFormContext } from "../../../../forms/components/FormComponents";
import type { Project } from "../../types";
import { budgetOptions, phaseOptions, priorityOptions } from "../fieldOptions";
import { useProjectForm } from "../hooks/useProjectForm";
import { FormActions } from "../../components/FormActions";
import { SaveFeedback } from "../../components/SaveFeedback";
export const ProjectForm = ({
  resource,
  organizationId,
  onCreated,
}: {
  resource?: Project;
  organizationId: string;
  onCreated?: () => void;
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
    <Form.Provider
      value={{
        ...editor,
        onChange: () => {
          return setSaved(false);
        },
      }}
    >
      <Form.Shell>
        <Form.Fields>
          <ProjectFormFields />
          <FormActions creating={!resource} />
        </Form.Fields>
        <Form.Feedback />
        <SaveFeedback visible={saved} />
      </Form.Shell>
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
