import { Link, useNavigate } from "@tanstack/react-router";
import { FormEditor } from "../../forms/components";
import { ExecutionProfileFields } from "../../domains/execution-profiles/components/ExecutionProfileFields";
import { useThreads, useThread } from "../../domains/threads/hooks/useThreads";
import { useThreadEditForms } from "../../domains/threads/hooks/useThreadEditForms";
import { useProcesses } from "../../domains/processes/hooks/useProcesses";
import { useExecutionProfile } from "../../domains/execution-profiles/hooks/useExecutionProfile";
import { ThreadFields } from "../../domains/threads/components/ThreadFields";
import {
  RuntimeDetailLayout,
  Loading,
  Missing,
  Status,
} from "../../shared/components/RuntimeLayout";
import { ProfileSummary } from "../RuntimeDetailHelpers";

export const ThreadListPage = () => {
  const query = useThreads();

  return (
    <>
      <h1>Threads</h1>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <div className="runtime-list">
          {query.data?.map((thread) => (
            <Link
              key={thread.id}
              className="runtime-card"
              to="/form-demo/threads/$threadId"
              params={{ threadId: thread.id }}
            >
              <strong>{thread.name}</strong>
              <Status value={thread.status} />
              <span>{thread.entryPoint}</span>
            </Link>
          ))}
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

  const process = processes.data?.find((item) => item.id === thread.data?.processId);

  return (
    <RuntimeDetailLayout title={thread.data.name} editTo={`/form-demo/threads/${id}/edit`}>
      <section className="runtime-details">
        <p>Entry point: {thread.data.entryPoint}</p>
        <Status value={thread.data.status} />
        <p>Priority: {thread.data.priority}</p>
        <p>
          Process:{" "}
          {process ? (
            <Link to="/form-demo/processes/$processId" params={{ processId: process.id }}>
              {process.name}
            </Link>
          ) : (
            thread.data.processId
          )}
        </p>
        <h2>Execution profile</h2>
        <ProfileSummary id={thread.data.executionProfileId} />
      </section>
    </RuntimeDetailLayout>
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

  const { entityForm, profileForm, save } = useThreadEditForms(id);

  if (query.isPending || profile.isPending) {
    return <Loading />;
  }

  return (
    <FormEditor.Provider
      mode="edit"
      isEditing
      defaultTab="entity"
      activeTab={activeTab}
      onActiveTabChange={onActiveTabChange}
      actions={save.actions}
      onCancel={() =>
        navigate({
          to: "/form-demo/threads/$threadId",
          params: { threadId: id },
          search: {},
        })
      }
    >
      <div className="runtime-editor-heading">
        <h1>Edit Thread</h1>
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
      <FormEditor.Actions />
    </FormEditor.Provider>
  );
};
