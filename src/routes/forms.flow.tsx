import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ActivityPanel, createActivity } from "../features/form-demos/ActivityPanel";
import { WorkspaceLayout } from "../features/workspace/components/WorkspaceLayout";
import { ResourceDataPanel } from "../features/workspace/components/ResourceDataPanel";
import { useWorkspaceLaunchForms } from "../features/workspace/hooks/useWorkspaceLaunchForms";
import {
  budgetOptions,
  dueWindowOptions,
  ownerOptions,
  priorityOptions,
  regionOptions,
  sectorOptions,
} from "../features/workspace/fieldOptions";

export const Route = createFileRoute("/forms/flow")({
  ssr: false,
  component: FlowFormRoute,
});

function FlowFormRoute() {
  const [activity, setActivity] = useState<Array<ReturnType<typeof createActivity>>>([]);
  const { organization, project, task, save, bootstrap } = useWorkspaceLaunchForms((text) => {
    setActivity((items) => [createActivity(text), ...items]);
  });

  return (
    <WorkspaceLayout
      title="Create a Workspace"
      description="Create an organization, project, and first task together."
      entity="flow"
    >
      <section className="forms-workspace app-workspace">
        <form
          className="form-panel app-form-panel flow-form-panel"
          onSubmit={(event) => {
            event.preventDefault();
            void save.submit();
          }}
        >
          <div className="panel-heading">
            <div>
              <h2>Workspace Launch</h2>
              <p>Account, project, and first task</p>
            </div>
            <span>{save.isSaving ? "Saving" : "Ready"}</span>
          </div>
          <fieldset className="workspace-launch-fields" disabled={save.isSaving}>
            <div className="form-section-label">Organization</div>
            <organization.form.AppField name="name">
              {(field) => <field.TextField label="Organization" placeholder="Acme Health" />}
            </organization.form.AppField>
            <div className="inline-fields">
              <organization.form.AppField name="sector">
                {(field) => <field.SelectField label="Sector" options={sectorOptions} />}
              </organization.form.AppField>
              <organization.form.AppField name="region">
                {(field) => <field.SelectField label="Region" options={regionOptions} />}
              </organization.form.AppField>
            </div>
            <div className="form-section-label">Project</div>
            <project.form.AppField name="name">
              {(field) => <field.TextField label="Project" placeholder="Patient Intake" />}
            </project.form.AppField>
            <div className="inline-fields">
              <project.form.AppField name="priority">
                {(field) => <field.RadioGroupField label="Priority" options={priorityOptions} />}
              </project.form.AppField>
              <project.form.AppField name="budget">
                {(field) => <field.SelectField label="Budget" options={budgetOptions} />}
              </project.form.AppField>
            </div>
            <div className="form-section-label">Task</div>
            <task.form.AppField name="title">
              {(field) => <field.TextField label="Task" placeholder="Provision workspace" />}
            </task.form.AppField>
            <div className="inline-fields">
              <task.form.AppField name="owner">
                {(field) => <field.SelectField label="Owner" options={ownerOptions} />}
              </task.form.AppField>
              <task.form.AppField name="dueWindow">
                {(field) => <field.SelectField label="Due" options={dueWindowOptions} />}
              </task.form.AppField>
            </div>
            <organization.form.SubmitButton label="Create workspace" isSaving={save.isSaving} />
          </fieldset>
          {save.result && (
            <div role="status">
              <p>
                {save.result.outcome === "success"
                  ? "Workspace created."
                  : save.result.outcome === "saved-with-follow-up-errors"
                    ? "Workspace created, but some follow-up actions failed."
                    : "Workspace creation did not complete."}
              </p>
              <ul>
                {Object.entries(save.result.forms).map(([id, state]) => (
                  <li key={id}>
                    {id}: {state.status}
                    {state.failure ? ` — ${String(state.failure.error)}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        <ResourceDataPanel
          data={bootstrap.data}
          isError={bootstrap.isError}
          isFetching={bootstrap.isFetching}
        />
        <ActivityPanel activity={activity} />
      </section>
    </WorkspaceLayout>
  );
}
