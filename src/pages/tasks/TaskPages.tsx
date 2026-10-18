import { useNavigate } from "@tanstack/react-router";
import { CommandLink as Link } from "../../shared/components/CommandLink";
import { FormEditor } from "../../forms/components";
import { ExecutionProfileFields } from "../../domains/execution-profiles/components/ExecutionProfileFields";
import { useTasks, useTask } from "../../domains/tasks/hooks/useTasks";
import { useTaskEditForms } from "../../domains/tasks/hooks/useTaskEditForms";
import { useTaskCreateForms } from "../../domains/tasks/hooks/useTaskCreateForms";
import { useProcesses } from "../../domains/processes/hooks/useProcesses";
import { useExecutionProfile } from "../../domains/execution-profiles/hooks/useExecutionProfile";
import { TaskFields } from "../../domains/tasks/components/TaskFields";
import { DetailLayout, Loading, Missing, Status } from "../form-demo/components/Layout";
import {
  ChildList,
  DetailProperties,
  ProfileSummary,
} from "../form-demo/components/DetailHelpers";
import { DetailView } from "../form-demo/components/DetailView";
import { ViewModePicker, useViewModePreference } from "../form-demo/components/ViewModePreference";
import { Number as FormattedNumber } from "../../shared/components/Number";
import { CycleableDateTime } from "../../forms/components";
export const TaskListPage = () => {
  const query = useTasks();

  return (
    <>
      <div className="heading">
        <h1>Tasks</h1>
        <Link className="primary-action" to="/form-demo/tasks/create">
          Create task
        </Link>
      </div>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <div className="list">
          {query.data?.map((task) => {
            return (
              <Link
                key={task.id}
                className="card"
                to="/form-demo/tasks/$taskId"
                params={{ taskId: task.id }}
              >
                <strong>{task.name}</strong>
                <Status value={task.status} />
                <span>{task.description}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
};

export const TaskDetailPage = ({ id }: { id: string }) => {
  const task = useTask(id);
  const processes = useProcesses(id);
  if (task.isPending) {
    return <Loading />;
  }

  if (!task.data) {
    return <Missing />;
  }

  return (
    <DetailLayout title={task.data.name} editTo={`/form-demo/tasks/${id}/edit`}>
      <DetailView
        tabs={[
          {
            value: "overview",
            label: "Overview",
            children: (
              <section className="details">
                <DetailProperties
                  properties={[
                    { label: "ID", value: task.data.id },
                    { label: "Name", value: task.data.name },
                    { label: "Description", value: task.data.description },
                    { label: "Status", value: <Status value={task.data.status} /> },
                    { label: "Priority", value: <FormattedNumber value={task.data.priority} /> },
                    { label: "Execution profile ID", value: task.data.executionProfileId },
                    {
                      label: "Created",
                      value: task.data.createdAt ? (
                        <CycleableDateTime value={task.data.createdAt} />
                      ) : (
                        "—"
                      ),
                    },
                    {
                      label: "Updated",
                      value: task.data.updatedAt ? (
                        <CycleableDateTime value={task.data.updatedAt} />
                      ) : (
                        "—"
                      ),
                    },
                  ]}
                />
              </section>
            ),
          },
          {
            value: "profile",
            label: "Execution Profile",
            children: (
              <section className="details">
                <ProfileSummary id={task.data.executionProfileId} />
              </section>
            ),
          },
          {
            value: "processes",
            label: "Processes",
            children: (
              <section className="details">
                <ChildList>
                  {processes.data?.map((process) => {
                    return (
                      <Link
                        key={process.id}
                        to="/form-demo/processes/$processId"
                        params={{ processId: process.id }}
                      >
                        <span>{process.name}</span>
                        <span className="relationship-meta">{process.command}</span>
                      </Link>
                    );
                  })}
                </ChildList>
              </section>
            ),
          },
        ]}
      />
    </DetailLayout>
  );
};

export const TaskEditPage = ({
  id,
  activeTab,
  onActiveTabChange,
}: {
  id: string;
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
}) => {
  const navigate = useNavigate();
  const query = useTask(id);
  const profile = useExecutionProfile(query.data?.executionProfileId ?? "");
  const { mode, updateMode } = useViewModePreference();

  const { entityForm, profileForm, save } = useTaskEditForms(id);

  if (query.isPending || profile.isPending) {
    return <Loading />;
  }

  return (
    <FormEditor.Provider
      mode="edit"
      isEditing
      defaultTab="entity"
      viewMode={mode}
      activeTab={activeTab}
      onActiveTabChange={onActiveTabChange}
      actions={save.actions}
      onCancel={() => {
        return navigate({ to: "/form-demo/tasks/$taskId", params: { taskId: id }, search: {} });
      }}
    >
      <div className="editor-heading">
        <h1>Edit Task</h1>
      </div>
      <div className="form-editor-view-mode-toolbar">
        <ViewModePicker mode={mode} onChange={updateMode} />
      </div>
      <FormEditor.TabList>
        <FormEditor.TabTrigger name="entity" label="Task" />
        <FormEditor.TabTrigger name="profile" label="Execution Profile" />
      </FormEditor.TabList>
      <FormEditor.Tab name="entity" label="Task">
        <TaskFields form={entityForm.form} />
      </FormEditor.Tab>
      <FormEditor.Tab name="profile" label="Execution Profile">
        <ExecutionProfileFields form={profileForm.form} />
      </FormEditor.Tab>
      <FormEditor.OrchestratorProgress />

      <FormEditor.OrchestratorStatus />

      <FormEditor.Actions />
    </FormEditor.Provider>
  );
};

export const TaskCreatePage = ({
  activeTab,
  onActiveTabChange,
}: {
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
}) => {
  const navigate = useNavigate();
  const { mode, updateMode } = useViewModePreference();
  const { entityForm, profileForm, save } = useTaskCreateForms();

  return (
    <FormEditor.Provider
      mode="create"
      isEditing
      defaultTab="entity"
      viewMode={mode}
      activeTab={activeTab}
      onActiveTabChange={onActiveTabChange}
      actions={save.actions}
      onCancel={() => {
        return navigate({ to: "/form-demo/tasks", search: {} });
      }}
      saveLabel="Create task"
      preventSaveWithoutChanges={false}
    >
      <div className="editor-heading">
        <h1>Create Task</h1>
      </div>
      <div className="form-editor-view-mode-toolbar">
        <ViewModePicker mode={mode} onChange={updateMode} />
      </div>
      <FormEditor.TabList>
        <FormEditor.TabTrigger name="entity" label="Task" />
        <FormEditor.TabTrigger name="profile" label="Execution Profile" />
      </FormEditor.TabList>
      <FormEditor.Tab name="entity" label="Task">
        <TaskFields form={entityForm.form} />
      </FormEditor.Tab>
      <FormEditor.Tab name="profile" label="Execution Profile">
        <ExecutionProfileFields form={profileForm.form} />
      </FormEditor.Tab>
      <FormEditor.OrchestratorProgress />
      <FormEditor.OrchestratorStatus />
      <FormEditor.Actions />
    </FormEditor.Provider>
  );
};
