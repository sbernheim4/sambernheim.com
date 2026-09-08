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
import { FormEditor } from "../forms/components";
import { useDependentField } from "../forms/hooks/useDependentField";

const FlowFormRoute = () => {
  const [activity, setActivity] = useState<Array<ReturnType<typeof createActivity>>>([]);

  const { organization, project, task, conductor, bootstrap } = useWorkspaceLaunchForms((text) => {
    setActivity((items) => {
      return [createActivity(text), ...items];
    });
  });
  const projectName = useDependentField({
    source: organization.form,
    select: (values) => {
      return values.name;
    },
    target: project.form,
    targetField: "name",
    format: (name, currentName) => {
      const suffix = currentName.replace(/^\[[^\]]*\]\s*/, "");
      return `[${name}] ${suffix}`;
    },
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
          <FormEditor.Provider
            mode="create"
            defaultTab="organization"
            actions={conductor.actions}
            saveLabel="Create workspace"
            showCancel={false}
          >
            <FormEditor.Layout className="form-panel app-form-panel flow-form-panel">
              <FormEditor.Main>
                <FormEditor.Header>
                  <div className="panel-heading">
                    <div>
                      <h2>Workspace Launch</h2>
                      <p>Account, project, and first task</p>
                    </div>
                    <FormEditor.Actions />
                  </div>
                  <FormEditor.TabList>
                    <FormEditor.TabTrigger name="organization" label="Organization" />
                    <FormEditor.TabTrigger name="project" label="Project" />
                    <FormEditor.TabTrigger name="task" label="Task" />
                  </FormEditor.TabList>
                </FormEditor.Header>
                <FormEditor.Error />
                <FormEditor.Content>
                  <FormEditor.Tab name="organization">
                    <Form.Fields className="workspace-launch-fields">
                      <div className="form-section-label">Organization</div>
                      <OrganizationFormFields onNameChange={projectName.onChange} />
                    </Form.Fields>
                  </FormEditor.Tab>
                  <FormEditor.Tab name="project">
                    <Form.Fields className="workspace-launch-fields">
                      <div className="form-section-label">Project</div>
                      <ProjectFormFields />
                    </Form.Fields>
                  </FormEditor.Tab>
                  <FormEditor.Tab name="task">
                    <Form.Fields className="workspace-launch-fields">
                      <div className="form-section-label">Task</div>
                      <TaskFormFields />
                    </Form.Fields>
                  </FormEditor.Tab>
                </FormEditor.Content>
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
                      {Object.entries(conductor.result.forms).map(([id, state]) => (
                        <li key={id}>
                          {id}: {state.status}
                          {state.failure ? ` — ${String(state.failure.error)}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </FormEditor.Main>
            </FormEditor.Layout>
          </FormEditor.Provider>
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
