import { Link, useNavigate } from "@tanstack/react-router";
import { useProcesses, useProcess } from "../../domains/processes/hooks/useProcesses";
import { useProcessEditForms } from "../../domains/processes/hooks/useProcessEditForms";
import { useThreads } from "../../domains/threads/hooks/useThreads";
import { useTasks } from "../../domains/tasks/hooks/useTasks";
import { useExecutionProfile } from "../../domains/execution-profiles/hooks/useExecutionProfile";
import { ProcessFields } from "../../domains/processes/components/ProcessFields";
import {
  RuntimeDetailLayout,
  RuntimeShell,
  Loading,
  Missing,
  Status,
} from "../../shared/components/RuntimeLayout";
import { ChildList, ProfileSummary, RuntimeEditor } from "../RuntimeEditor";

export const ProcessListPage = () => {
  const query = useProcesses();

  return (
    <RuntimeShell>
      <h1>Processes</h1>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <div className="runtime-list">
          {query.data?.map((process) => (
            <Link
              key={process.id}
              className="runtime-card"
              to="/processes/$processId"
              params={{ processId: process.id }}
            >
              <strong>{process.name}</strong>
              <Status value={process.status} />
              <span>{process.command}</span>
            </Link>
          ))}
        </div>
      )}
    </RuntimeShell>
  );
};

export const ProcessDetailPage = ({ id }: { id: string }) => {
  const process = useProcess(id);
  const threads = useThreads(id);
  const tasks = useTasks();
  if (process.isPending) {
    return <Loading />;
  }

  if (!process.data) {
    return <Missing />;
  }

  const task = tasks.data?.find((item) => item.id === process.data?.taskId);

  return (
    <RuntimeDetailLayout title={process.data.name} editTo={`/processes/${id}/edit`}>
      <section className="runtime-details">
        <p>
          Task:{" "}
          {task ? (
            <Link to="/tasks/$taskId" params={{ taskId: task.id }}>
              {task.name}
            </Link>
          ) : (
            process.data.taskId
          )}
        </p>
        <p>Command: {process.data.command}</p>
        <Status value={process.data.status} />
        <h2>Execution profile</h2>
        <ProfileSummary id={process.data.executionProfileId} />
        <h2>Threads</h2>
        <ChildList>
          {threads.data?.map((thread) => (
            <Link key={thread.id} to="/threads/$threadId" params={{ threadId: thread.id }}>
              {thread.name}
            </Link>
          ))}
        </ChildList>
      </section>
    </RuntimeDetailLayout>
  );
};

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
  const query = useProcess(id);
  const profile = useExecutionProfile(query.data?.executionProfileId ?? "");

  const { entityForm, profileForm, save } = useProcessEditForms(id);

  if (query.isPending || profile.isPending) {
    return <Loading />;
  }

  return (
    <RuntimeShell>
      <RuntimeEditor
        entity="Process"
        entityForm={entityForm}
        profileForm={profileForm}
        save={save}
        activeTab={activeTab}
        onActiveTabChange={onActiveTabChange}
        onCancel={() =>
          navigate({ to: "/processes/$processId", params: { processId: id }, search: {} })
        }
      >
        <ProcessFields form={entityForm.form} />
      </RuntimeEditor>
    </RuntimeShell>
  );
};
