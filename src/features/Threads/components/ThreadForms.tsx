import { useNavigate } from "@tanstack/react-router";
import {
  FormEditor,
  ExecutionProfileFields,
  useThread,
  useThreadEditForms,
  useThreadCreateForms,
  useExecutionProfile,
  ThreadFields,
} from "@/features";
import { useWorkspaceRenderer } from "@features/Workspace/components/renderer";
import { useViewModePreference } from "@features/Workspace/hooks/useViewModePreference";

export const ThreadEditPage = ({
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
  const query = useThread(id);
  const profile = useExecutionProfile(query.data?.executionProfileId ?? "");
  const { mode, updateMode } = useViewModePreference();

  const { entityForm, profileForm, save } = useThreadEditForms(id);

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
          to: "/form-demo/threads/$threadId",
          params: { threadId: id },
          search: {},
        });
      }}
    >
      <FormEditor.Title>Edit Thread</FormEditor.Title>
      <FormEditor.ViewModePicker mode={mode} onChange={updateMode} />
      <FormEditor.TabList>
        <FormEditor.TabTrigger name="entity" label="Thread" />
        <FormEditor.TabTrigger name="profile" label="Execution Profile" />
      </FormEditor.TabList>
      <FormEditor.Tab name="entity" label="Thread">
        <ThreadFields form={entityForm.form} />
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

export const ThreadCreatePage = ({
  activeTab,
  onActiveTabChange,
}: {
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
}) => {
  const navigate = useNavigate();
  const { mode, updateMode } = useViewModePreference();
  const { entityForm, profileForm, save } = useThreadCreateForms();

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
        return navigate({ to: "/form-demo/threads", search: {} });
      }}
      saveLabel="Create thread"
      preventSaveWithoutChanges={false}
    >
      <FormEditor.Title>Create Thread</FormEditor.Title>
      <FormEditor.ViewModePicker mode={mode} onChange={updateMode} />
      <FormEditor.TabList>
        <FormEditor.TabTrigger name="entity" label="Thread" />
        <FormEditor.TabTrigger name="profile" label="Execution Profile" />
      </FormEditor.TabList>
      <FormEditor.Tab name="entity" label="Thread">
        <ThreadFields form={entityForm.form} />
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
