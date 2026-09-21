import { Link, useNavigate } from "@tanstack/react-router";
import { useThreads, useThread } from "../../domains/threads/hooks/useThreads";
import { useThreadEditForms } from "../../domains/threads/hooks/useThreadEditForms";
import { useProcesses } from "../../domains/processes/hooks/useProcesses";
import { useExecutionProfile } from "../../domains/execution-profiles/hooks/useExecutionProfile";
import { ThreadFields } from "../../domains/threads/components/ThreadFields";
import {
  RuntimeDetailLayout,
  RuntimeShell,
  Loading,
  Missing,
  Status,
} from "../../shared/components/RuntimeLayout";
import { ProfileSummary, RuntimeEditor } from "../RuntimeEditor";

export const ThreadListPage = () => {
  const query = useThreads();

  return (
    <RuntimeShell>
      <h1>Threads</h1>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <div className="runtime-list">
          {query.data?.map((thread) => (
            <Link
              key={thread.id}
              className="runtime-card"
              to="/threads/$threadId"
              params={{ threadId: thread.id }}
            >
              <strong>{thread.name}</strong>
              <Status value={thread.status} />
              <span>{thread.entryPoint}</span>
            </Link>
          ))}
        </div>
      )}
    </RuntimeShell>
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
    <RuntimeDetailLayout title={thread.data.name} editTo={`/threads/${id}/edit`}>
      <section className="runtime-details">
        <p>Entry point: {thread.data.entryPoint}</p>
        <Status value={thread.data.status} />
        <p>Priority: {thread.data.priority}</p>
        <p>
          Process:{" "}
          {process ? (
            <Link to="/processes/$processId" params={{ processId: process.id }}>
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
    <RuntimeShell>
      <RuntimeEditor
        entity="Thread"
        entityForm={entityForm}
        profileForm={profileForm}
        save={save}
        activeTab={activeTab}
        onActiveTabChange={onActiveTabChange}
        onCancel={() =>
          navigate({ to: "/threads/$threadId", params: { threadId: id }, search: {} })
        }
      >
        <ThreadFields form={entityForm.form} />
      </RuntimeEditor>
    </RuntimeShell>
  );
};
