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
import { useWorkspaceRenderer } from "@features/Workspace/components/renderer";
import { useViewModePreference } from "@features/Workspace/hooks/useViewModePreference";

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
  const { Loading } = useWorkspaceRenderer();
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
        return navigate({
          to: "/experiments/workspace/tasks/$taskId",
          params: { taskId: id },
          search: {},
        });
      }}
    >
      <FormEditor.Title>Edit Task</FormEditor.Title>
      <FormEditor.ViewModePicker mode={mode} onChange={updateMode} />
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
      <FormEditor.Undo />
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
        return navigate({ to: "/experiments/workspace/tasks", search: {} });
      }}
      saveLabel="Create task"
      preventSaveWithoutChanges={false}
    >
      <FormEditor.Title>Create Task</FormEditor.Title>
      <FormEditor.ViewModePicker mode={mode} onChange={updateMode} />
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
      <FormEditor.Undo />
    </FormEditor.Provider>
  );
};
