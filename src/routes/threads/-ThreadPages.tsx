import { Link, useNavigate } from "@tanstack/react-router";
import { FormEditor } from "../../forms/components";
import { ExecutionProfileFields } from "../../domains/execution-profiles/components/ExecutionProfileFields";
import { useThreads, useThread } from "../../domains/threads/hooks/useThreads";
import { useThreadEditForms } from "../../domains/threads/hooks/useThreadEditForms";
import { useProcesses } from "../../domains/processes/hooks/useProcesses";
import { useExecutionProfile } from "../../domains/execution-profiles/hooks/useExecutionProfile";
import { ThreadFields } from "../../domains/threads/components/ThreadFields";
import { DetailLayout, Loading, Missing, Status } from "../form-demo/components/-Layout";
import { ProfileSummary } from "../form-demo/components/-DetailHelpers";
import { DetailView } from "../form-demo/components/-DetailView";
import { ViewModePicker, useViewModePreference } from "../form-demo/components/-ViewModePreference";

export const ThreadListPage = () => {
  const query = useThreads();

  return (
    <>
      <h1>Threads</h1>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <div className="list">
          {query.data?.map((thread) => {
            return (
              <Link
                key={thread.id}
                className="card"
                to="/form-demo/threads/$threadId"
                params={{ threadId: thread.id }}
              >
                <strong>{thread.name}</strong>
                <Status value={thread.status} />
                <span>{thread.entryPoint}</span>
              </Link>
            );
          })}
        </div>
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
                <div className="summary-grid">
                  <div>
                    <span className="eyebrow">Entry point</span>
                    <strong>{thread.data.entryPoint}</strong>
                  </div>
                  <div>
                    <span className="eyebrow">Priority</span>
                    <strong>{thread.data.priority}</strong>
                  </div>
                  <div>
                    <span className="eyebrow">Status</span>
                    <Status value={thread.data.status} />
                  </div>
                </div>
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
        <ViewModePicker mode={mode} onChange={updateMode} />
      </div>
      <FormEditor.TabList>
        <FormEditor.TabTrigger name="entity" label="Thread" />
        <FormEditor.TabTrigger name="profile" label="Execution Profile" />
      </FormEditor.TabList>
      <FormEditor.Tab name="entity">
        <ThreadFields form={entityForm.form} />
      </FormEditor.Tab>
      <FormEditor.Tab name="profile">
        <ExecutionProfileFields form={profileForm.form} />
      </FormEditor.Tab>
      <FormEditor.OrchestratorProgress />

      <FormEditor.OrchestratorStatus />

      <FormEditor.Actions />
    </FormEditor.Provider>
  );
};
