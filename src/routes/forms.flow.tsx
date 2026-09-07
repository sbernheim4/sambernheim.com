import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ActivityPanel, createActivity } from "../features/form-demos/ActivityPanel";
import { WorkspaceLayout } from "../features/workspace/components/WorkspaceLayout";
import { ResourceDataPanel } from "../features/workspace/components/ResourceDataPanel";
import { OrganizationFormFields } from "../features/workspace/organizations/components/OrganizationForm";
import { ProjectFormFields } from "../features/workspace/projects/components/ProjectForm";
import { TaskFormFields } from "../features/workspace/tasks/components/TaskForm";
import { useWorkspaceLaunchForms } from "../features/workspace/hooks/useWorkspaceLaunchForms";
import { Form } from "../forms/components/FormComponents";

const FlowFormRoute = () => {
  const [activity, setActivity] = useState<Array<ReturnType<typeof createActivity>>>([]);

  const { organization, project, task, conductor, bootstrap } = useWorkspaceLaunchForms((text) => {
    setActivity((items) => {
      return [createActivity(text), ...items];
    });
  });

  return (
    <WorkspaceLayout
      title="Create a Workspace"
      description="Create an organization, project, and first task together."
      entity="flow"
    >
      <section className="forms-workspace app-workspace">
        <Form.Provider
          value={{
            form: conductor.provider,
            forms: {
              organization: organization.form,
              project: project.form,
              task: task.form,
            },
            isReady: true,
            isSaving: conductor.isSaving,
            isDirty: conductor.isDirty,
            result: conductor.result,
          }}
        >
          <Form.Shell className="form-panel app-form-panel flow-form-panel">
            <div className="panel-heading">
              <div>
                <h2>Workspace Launch</h2>
                <p>Account, project, and first task</p>
              </div>
              <span>{conductor.isSaving ? "Saving" : "Ready"}</span>
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

            {conductor.result && (
              <div role="status">
                <p>
                  {conductor.result.outcome === "success"
                    ? "Workspace created."
                    : conductor.result.outcome === "saved-with-follow-up-errors"
                      ? "Workspace created, but some follow-up actions failed."
                      : "Workspace creation did not complete."}
                </p>
                <ul>
                  {Object.entries(conductor.result.forms).map(([id, state]) => {
                    return (
                      <li key={id}>
                        {id}: {state.status}
                        {state.failure ? ` — ${String(state.failure.error)}` : ""}
                      </li>
                    );
                  })}
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
};

export const Route = createFileRoute("/forms/flow")({
  ssr: false,
  component: FlowFormRoute,
});
