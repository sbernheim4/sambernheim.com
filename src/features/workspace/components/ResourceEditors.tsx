import { useState } from "react";
import type { Organization, Project, Task } from "../types";
import { useOrganizationForm, useProjectForm, useTaskForm } from "../hooks/forms";
import { Form, useFormContext } from "../../../forms/ui/FormComponents";
import {
  budgetOptions,
  dueWindowOptions,
  ownerOptions,
  phaseOptions,
  priorityOptions,
  regionOptions,
  sectorOptions,
  statusOptions,
  taskStatusOptions,
} from "../fieldOptions";

export function OrganizationEditor(props: {
  resource?: Organization;
  onCreated?: () => void;
}) {
  return <OrganizationForm {...props} />;
}

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

export function ProjectEditor(props: {
  resource?: Project;
  organizationId: string;
  onCreated?: () => void;
}) {
  return <ProjectForm {...props} />;
}

export function ProjectForm({
  resource,
  organizationId,
  onCreated,
}: {
  resource?: Project;
  organizationId: string;
  onCreated?: () => void;
}) {
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
    <Form.Provider value={{ ...editor, onChange: () => setSaved(false) }}>
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
}

export function TaskEditor(props: {
  resource?: Task;
  project: Project;
  onCreated?: () => void;
}) {
  return <TaskForm {...props} />;
}

export function TaskForm({
  resource,
  project,
  onCreated,
}: {
  resource?: Task;
  project: Project;
  onCreated?: () => void;
}) {
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
    <Form.Provider value={{ ...editor, onChange: () => setSaved(false) }}>
      <Form.Shell>
        <Form.Fields>
          <TaskFormFields />
          <FormActions creating={!resource} />
        </Form.Fields>
        <Form.Feedback />
        <SaveFeedback visible={saved} />
      </Form.Shell>
    </Form.Provider>
  );
}

function FormActions({ creating }: { creating: boolean }) {
  return (
    <div className="form-actions">
      <Form.SaveButton label={creating ? "Create" : "Save changes"} />
      <Form.DiscardButton />
    </div>
  );
}

function SaveFeedback({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }
  return (
    <p className="save-feedback" role="status">
      Changes saved.
    </p>
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

export function ProjectFormFields() {
  const typedForm = useFormContext<ReturnType<typeof useProjectForm>["form"]>("project");
  return (
    <>
      <typedForm.AppField name="name">
        {(field) => <field.TextField label="Project name" required />}
      </typedForm.AppField>
      <typedForm.AppField name="priority">
        {(field) => <field.RadioGroupField label="Priority" options={priorityOptions} />}
      </typedForm.AppField>
      <typedForm.AppField name="phase">
        {(field) => <field.SelectField label="Phase" options={phaseOptions} />}
      </typedForm.AppField>
      <typedForm.AppField name="budget">
        {(field) => <field.SelectField label="Budget" options={budgetOptions} />}
      </typedForm.AppField>
    </>
  );
}

export function TaskFormFields() {
  const typedForm = useFormContext<ReturnType<typeof useTaskForm>["form"]>("task");
  return (
    <>
      <typedForm.AppField name="title">
        {(field) => <field.TextField label="Task title" required />}
      </typedForm.AppField>
      <typedForm.AppField name="owner">
        {(field) => <field.SelectField label="Owner" options={ownerOptions} />}
      </typedForm.AppField>
      <typedForm.AppField name="status">
        {(field) => <field.RadioGroupField label="Status" options={taskStatusOptions} />}
      </typedForm.AppField>
      <typedForm.AppField name="dueWindow">
        {(field) => <field.SelectField label="Due" options={dueWindowOptions} />}
      </typedForm.AppField>
    </>
  );
}
