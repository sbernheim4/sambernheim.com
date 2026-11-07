import { useNavigate } from "@tanstack/react-router";
import { CommandLink as Link } from "@/features";
import { FormEditor } from "@/features";
import { ExecutionProfileFields } from "@/features";
import { useTasks, useTask } from "@/features";
import { useTaskEditForms } from "@/features";
import { useTaskCreateForms } from "@/features";
import { useProcesses } from "@/features";
import { useExecutionProfile } from "@/features";
import { TaskFields } from "@/features";
import { DetailLayout, Loading, Missing, Status } from "../form-demo/components/Layout";
import { ChildList, DetailProperties, ProfileSummary } from "../form-demo/components/DetailHelpers";
import { DetailView } from "../form-demo/components/DetailView";
import { ViewModePicker, useViewModePreference } from "../form-demo/components/ViewModePreference";
import { Number as FormattedNumber } from "@/features";
import { CycleableDateTime } from "@/features";
import { parseUtcDate } from "@/utils";
import { EntityTable } from "../form-demo/components/EntityTable";
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
        <EntityTable
          data={(query.data ?? []).map((task) => ({
            id: task.id,
            name: task.name,
            status: task.status,
            summary: task.description,
            href: `/form-demo/tasks/${task.id}`,
          }))}
        />
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
                        <CycleableDateTime value={parseUtcDate(task.data.createdAt)} />
                      ) : (
                        "—"
                      ),
                    },
                    {
                      label: "Updated",
                      value: task.data.updatedAt ? (
                        <CycleableDateTime value={parseUtcDate(task.data.updatedAt)} />
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
