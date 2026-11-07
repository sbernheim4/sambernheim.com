import { useNavigate } from "@tanstack/react-router";
import {
  FormEditor,
  ExecutionProfileFields,
  useTask,
  useTaskEditForms,
  useTaskCreateForms,
  useExecutionProfile,
  TaskFields,
} from "@/features";
import { Loading } from "@features/Workspace/components/web/Layout";
import {
  ViewModePicker,
  useViewModePreference,
} from "@features/Workspace/components/web/ViewModePreference";
import { TaskList } from "./TaskList";
import { TaskDetail } from "./TaskDetail";

export const TaskListPage = TaskList;
export const TaskDetailPage = TaskDetail;

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
