import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ActivityPanel, createActivity } from "../features/form-demos/ActivityPanel";
import { WorkspaceLayout } from "../features/workspace/components/WorkspaceLayout";
import { ResourceDataPanel } from "../features/workspace/components/ResourceDataPanel";
import {
  OrganizationFormFields,
  ProjectFormFields,
  TaskFormFields,
} from "../features/workspace/components/ResourceEditors";
import { useWorkspaceLaunchForms } from "../features/workspace/hooks/useWorkspaceLaunchForms";
import { Form } from "../forms/ui/FormComponents";

export const Route = createFileRoute("/forms/flow")({
  ssr: false,
  component: FlowFormRoute,
});

function FlowFormRoute() {
  const [activity, setActivity] = useState<Array<ReturnType<typeof createActivity>>>([]);
  const { organization, project, task, save, bootstrap } = useWorkspaceLaunchForms((text) => {
    setActivity((items) => [createActivity(text), ...items]);
  });
  const aggregateForm = {
    handleSubmit: () => save.submit(),
    reset: () => {
      organization.form.reset();
      project.form.reset();
      task.form.reset();
    },
  };

  return (
    <WorkspaceLayout
      title="Create a Workspace"
      description="Create an organization, project, and first task together."
      entity="flow"
    >
      <section className="forms-workspace app-workspace">
        <Form.Provider
          value={{
            form: aggregateForm,
            forms: {
              organization: organization.form,
              project: project.form,
              task: task.form,
            },
            isReady: true,
            isSaving: save.isSaving,
            isDirty: save.isDirty,
            result: save.result,
          }}
        >
          <Form.Shell className="form-panel app-form-panel flow-form-panel">
            <div className="panel-heading">
              <div>
                <h2>Workspace Launch</h2>
                <p>Account, project, and first task</p>
              </div>
              <span>{save.isSaving ? "Saving" : "Ready"}</span>
            </div>

            <Form.Fields className="workspace-launch-fields">

              <div className="form-section-label">Organization</div>
              <OrganizationFormFields />

              <div className="form-section-label">Project</div>
              <ProjectFormFields />

              <div className="form-section-label">Task</div>
              <TaskFormFields />

              <div className="form-actions">
                <Form.SaveButton label="Create workspace" />
                <Form.DiscardButton />
              </div>
            </Form.Fields>

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

          </Form.Shell>
        </Form.Provider>

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
