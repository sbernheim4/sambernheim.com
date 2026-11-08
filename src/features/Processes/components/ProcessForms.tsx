import { useNavigate } from "@tanstack/react-router";
import {
  FormEditor,
  ExecutionProfileFields,
  useProcess,
  useProcessEditForms,
  useProcessCreateForms,
  useExecutionProfile,
  ProcessFields,
} from "@/features";
import { useWorkspaceRenderer } from "@features/Workspace/components/renderer";
import { useViewModePreference } from "@features/Workspace/hooks/useViewModePreference";

export const ProcessEditPage = ({
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
  const query = useProcess(id);
  const profile = useExecutionProfile(query.data?.executionProfileId ?? "");
  const { mode, updateMode } = useViewModePreference();

  const { entityForm, profileForm, save } = useProcessEditForms(id);

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
          to: "/form-demo/processes/$processId",
          params: { processId: id },
          search: {},
        });
      }}
    >
      <FormEditor.Title>Edit Process</FormEditor.Title>
      <FormEditor.ViewModePicker mode={mode} onChange={updateMode} />
      <FormEditor.TabList>
        <FormEditor.TabTrigger name="entity" label="Process" />
        <FormEditor.TabTrigger name="profile" label="Execution Profile" />
      </FormEditor.TabList>

      <FormEditor.Tab name="entity" label="Process">
        <ProcessFields form={entityForm.form} />
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

export const ProcessCreatePage = ({
  activeTab,
  onActiveTabChange,
}: {
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
}) => {
  const navigate = useNavigate();
  const { mode, updateMode } = useViewModePreference();
  const { entityForm, profileForm, save } = useProcessCreateForms();

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
        return navigate({ to: "/form-demo/processes", search: {} });
      }}
      saveLabel="Create process"
      preventSaveWithoutChanges={false}
    >
      <FormEditor.Title>Create Process</FormEditor.Title>
      <FormEditor.ViewModePicker mode={mode} onChange={updateMode} />
      <FormEditor.TabList>
        <FormEditor.TabTrigger name="entity" label="Process" />
        <FormEditor.TabTrigger name="profile" label="Execution Profile" />
      </FormEditor.TabList>
      <FormEditor.Tab name="entity" label="Process">
        <ProcessFields form={entityForm.form} />
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
