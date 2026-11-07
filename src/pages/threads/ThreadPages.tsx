import { useNavigate } from "@tanstack/react-router";
import { CommandLink as Link } from "@/features";
import { FormEditor } from "@/features";
import { ExecutionProfileFields } from "@/features";
import { useThreads, useThread } from "@/features";
import { useThreadEditForms } from "@/features";
import { useThreadCreateForms } from "@/features";
import { useProcesses } from "@/features";
import { useExecutionProfile } from "@/features";
import { ThreadFields } from "@/features";
import { DetailLayout, Loading, Missing, Status } from "../form-demo/components/Layout";
import { DetailProperties, ProfileSummary } from "../form-demo/components/DetailHelpers";
import { DetailView } from "../form-demo/components/DetailView";
import { ViewModePicker, useViewModePreference } from "../form-demo/components/ViewModePreference";
import { Number as FormattedNumber } from "@/features";
import { CycleableDateTime } from "@/features";
import { parseUtcDate } from "@/utils";
import { EntityTable } from "../../features/EntityTable/components/web/EntityTable";
export const ThreadListPage = () => {
  const query = useThreads();

  return (
    <>
      <div className="heading">
        <h1>Threads</h1>
        <Link className="primary-action" to="/form-demo/threads/create">
          Create thread
        </Link>
      </div>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <EntityTable data={(query.data ?? []).map((thread) => ({ id: thread.id, name: thread.name, status: thread.status, summary: thread.entryPoint, href: `/form-demo/threads/${thread.id}` }))} />
      )}
    </>
  );
};

export const ThreadDetailPage = ({ id }: { id: string }) => {
  const thread = useThread(id);
  const processes = useProcesses();
  if (thread.isPending) {
    return <Loading />;
  }

  if (!thread.data) {
    return <Missing />;
  }

  const process = processes.data?.find((item) => {
    return item.id === thread.data?.processId;
  });

  return (
    <DetailLayout title={thread.data.name} editTo={`/form-demo/threads/${id}/edit`}>
      <DetailView
        tabs={[
          {
            value: "overview",
            label: "Overview",
            children: (
              <section className="details">
                <DetailProperties
                  properties={[
                    { label: "ID", value: thread.data.id },
                    { label: "Name", value: thread.data.name },
                    { label: "Entry point", value: thread.data.entryPoint },
                    { label: "Status", value: <Status value={thread.data.status} /> },
                    { label: "Priority", value: <FormattedNumber value={thread.data.priority} /> },
                    { label: "Process ID", value: thread.data.processId },
                    { label: "Execution profile ID", value: thread.data.executionProfileId },
                    {
                      label: "Created",
                      value: thread.data.createdAt ? (
                        <CycleableDateTime value={parseUtcDate(thread.data.createdAt)} />
                      ) : (
                        "—"
                      ),
                    },
                    {
                      label: "Updated",
                      value: thread.data.updatedAt ? (
                        <CycleableDateTime value={parseUtcDate(thread.data.updatedAt)} />
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
                <ProfileSummary id={thread.data.executionProfileId} />
              </section>
            ),
          },
          {
            value: "process",
            label: "Parent Process",
            children: (
              <section className="details">
                {process ? (
                  <Link to="/form-demo/processes/$processId" params={{ processId: process.id }}>
                    {process.name}
                  </Link>
                ) : (
                  <strong>{thread.data.processId}</strong>
                )}
              </section>
            ),
          },
        ]}
      />
    </DetailLayout>
  );
};

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
      <div className="editor-heading">
        <h1>Edit Thread</h1>
      </div>
      <div className="form-editor-view-mode-toolbar">
        <ViewModePicker mode={mode} onChange={updateMode} />
      </div>
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
      <div className="editor-heading">
        <h1>Create Thread</h1>
      </div>
      <div className="form-editor-view-mode-toolbar">
        <ViewModePicker mode={mode} onChange={updateMode} />
      </div>
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
