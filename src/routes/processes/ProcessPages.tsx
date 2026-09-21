import { Link, useNavigate } from "@tanstack/react-router";
import { FormEditor } from "../../forms/components";
import { ExecutionProfileFields } from "../../domains/execution-profiles/components/ExecutionProfileFields";
import { useProcesses, useProcess } from "../../domains/processes/hooks/useProcesses";
import { useProcessEditForms } from "../../domains/processes/hooks/useProcessEditForms";
import { useThreads } from "../../domains/threads/hooks/useThreads";
import { useTasks } from "../../domains/tasks/hooks/useTasks";
import { useExecutionProfile } from "../../domains/execution-profiles/hooks/useExecutionProfile";
import { ProcessFields } from "../../domains/processes/components/ProcessFields";
import { DetailLayout, Loading, Missing, Status } from "../form-demo/components/Layout";
import { ChildList, ProfileSummary } from "../form-demo/components/DetailHelpers";

export const ProcessListPage = () => {
  const query = useProcesses();

  return (
    <>
      <h1>Processes</h1>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <div className="list">
          {query.data?.map((process) => (
            <Link
              key={process.id}
              className="card"
              to="/form-demo/processes/$processId"
              params={{ processId: process.id }}
            >
              <strong>{process.name}</strong>
              <Status value={process.status} />
              <span>{process.command}</span>
            </Link>
          ))}
        </div>
      )}
    </>
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
    <DetailLayout title={process.data.name} editTo={`/form-demo/processes/${id}/edit`}>
      <section className="details">
        <p>
          Task:{" "}
          {task ? (
            <Link to="/form-demo/tasks/$taskId" params={{ taskId: task.id }}>
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
            <Link
              key={thread.id}
              to="/form-demo/threads/$threadId"
              params={{ threadId: thread.id }}
            >
              {thread.name}
            </Link>
          ))}
        </ChildList>
      </section>
    </DetailLayout>
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
    <FormEditor.Provider
      mode="edit"
      isEditing
      defaultTab="entity"
      activeTab={activeTab}
      onActiveTabChange={onActiveTabChange}
      actions={save.actions}
      onCancel={() =>
        navigate({
          to: "/form-demo/processes/$processId",
          params: { processId: id },
          search: {},
        })
      }
    >
      <div className="editor-heading">
        <h1>Edit Process</h1>
      </div>

      <FormEditor.TabList>
        <FormEditor.TabTrigger name="entity" label="Process" />
        <FormEditor.TabTrigger name="profile" label="Execution Profile" />
      </FormEditor.TabList>

      <FormEditor.Tab name="entity">
        <ProcessFields form={entityForm.form} />
      </FormEditor.Tab>

      <FormEditor.Tab name="profile">
        <ExecutionProfileFields form={profileForm.form} />
      </FormEditor.Tab>

      <FormEditor.Actions />
    </FormEditor.Provider>
  );
};
