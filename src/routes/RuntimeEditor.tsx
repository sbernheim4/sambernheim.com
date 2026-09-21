import type { ReactNode } from "react";
import { FormEditor } from "../forms/components";
import { ExecutionProfileFields } from "../domains/execution-profiles/components/ExecutionProfileFields";
import { useExecutionProfile } from "../domains/execution-profiles/hooks/useExecutionProfile";

export const ProfileSummary = ({ id }: { id: string }) => {
  const profile = useExecutionProfile(id);

  if (profile.isPending) {
    return <p>Loading profile...</p>;
  }

  return (
    <p>
      {profile.data
        ? `${profile.data.name} · ${profile.data.runtime} · ${profile.data.region}`
        : "No profile"}
    </p>
  );
};

export const ChildList = ({ children }: { children: ReactNode }) => (
  <div className="child-list">{children}</div>
);

export const RuntimeEditor = ({
  entity,
  entityForm,
  profileForm,
  save,
  onCancel,
  children,
  activeTab,
  onActiveTabChange,
}: {
  entity: string;
  entityForm: any;
  profileForm: any;
  save: any;
  onCancel: () => void;
  children: ReactNode;
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
}) => {
  return (
    <FormEditor.Provider
      mode="edit"
      isEditing
      defaultTab="entity"
      activeTab={activeTab}
      onActiveTabChange={onActiveTabChange}
      actions={save.actions}
      onCancel={onCancel}
    >
      <div className="runtime-editor-heading">
        <h1>Edit {entity}</h1>
      </div>
      <FormEditor.TabList>
        <FormEditor.TabTrigger name="entity" label={entity} />
        <FormEditor.TabTrigger name="profile" label="Execution Profile" />
      </FormEditor.TabList>
      <FormEditor.Tab name="entity">{children}</FormEditor.Tab>
      <FormEditor.Tab name="profile">
        <ExecutionProfileFields form={profileForm.form} />
      </FormEditor.Tab>
      <FormEditor.Actions />
    </FormEditor.Provider>
  );
};
