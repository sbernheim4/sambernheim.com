import { useState } from "react";
import type { Organization, Project, Task } from "../types";
import { useOrganizationForm, useProjectForm, useTaskForm } from "../hooks/forms";

export function OrganizationEditor({
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
      if (!resource) onCreated?.();
    },
  });
  return <ResourceEditor editor={editor} creating={!resource} saved={saved} setSaved={setSaved} />;
}
export function ProjectEditor({
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
      if (!resource) onCreated?.();
    },
  });
  return <ResourceEditor editor={editor} creating={!resource} saved={saved} setSaved={setSaved} />;
}
export function TaskEditor({
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
      if (!resource) onCreated?.();
    },
  });
  return <ResourceEditor editor={editor} creating={!resource} saved={saved} setSaved={setSaved} />;
}
function ResourceEditor({
  editor,
  creating,
  saved,
  setSaved,
}: {
  editor: Pick<
    ReturnType<typeof useOrganizationForm>,
    "form" | "fields" | "isReady" | "isSaving" | "error"
  > & { result?: { outcome: string } };
  creating: boolean;
  saved: boolean;
  setSaved: (value: boolean) => void;
}) {
  return (
    <form
      className="resource-editor"
      onChange={() => setSaved(false)}
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(false);
        void editor.form.handleSubmit().catch(() => {});
      }}
    >
      <fieldset disabled={editor.isSaving || !editor.isReady} className="editor-fields">
        {editor.fields.map((item) => (
          <editor.form.AppField key={item.name} name={item.name}>
            {(field) =>
              item.mode === "radio" ? (
                <field.RadioGroupField label={item.label} options={item.options ?? []} />
              ) : item.mode === "select" ? (
                <field.SelectField label={item.label} options={item.options ?? []} />
              ) : (
                <field.TextField label={item.label} required />
              )
            }
          </editor.form.AppField>
        ))}
        <editor.form.SubmitButton
          label={creating ? "Create" : "Save changes"}
          isSaving={editor.isSaving}
        />
      </fieldset>
      {editor.error && (
        <p className="form-error" role="alert">
          {String(editor.error)}
        </p>
      )}
      {editor.result?.outcome === "saved-with-follow-up-errors" && (
        <p role="status">Saved, but a follow-up action failed.</p>
      )}
      {saved && (
        <p className="save-feedback" role="status">
          Changes saved.
        </p>
      )}
    </form>
  );
}
