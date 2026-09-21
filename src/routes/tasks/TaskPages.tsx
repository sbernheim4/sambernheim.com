import { Link, useNavigate } from "@tanstack/react-router";
import { FormEditor } from "../../forms/components";
import { ExecutionProfileFields } from "../../domains/execution-profiles/components/ExecutionProfileFields";
import { useTasks, useTask } from "../../domains/tasks/hooks/useTasks";
import { useTaskEditForms } from "../../domains/tasks/hooks/useTaskEditForms";
import { useProcesses } from "../../domains/processes/hooks/useProcesses";
import { useExecutionProfile } from "../../domains/execution-profiles/hooks/useExecutionProfile";
import { TaskFields } from "../../domains/tasks/components/TaskFields";
import {
  RuntimeDetailLayout,
  Loading,
  Missing,
  Status,
} from "../../shared/components/RuntimeLayout";
import { ChildList, ProfileSummary } from "../RuntimeDetailHelpers";

export const TaskListPage = () => {
  const query = useTasks();

  return (
    <>
      <h1>Tasks</h1>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <div className="runtime-list">
          {query.data?.map((task) => (
            <Link
              key={task.id}
              className="runtime-card"
              to="/form-demo/tasks/$taskId"
              params={{ taskId: task.id }}
            >
              <strong>{task.name}</strong>
              <Status value={task.status} />
              <span>{task.description}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export const TaskDetailPage = ({ id }: { id: string }) => {
  const task = useTask(id);
  const processes = useProcesses(id);
  if (task.isPending) {
    return <Loading />;
  }

  if (!task.data) {
    return <Missing />;
  }

  return (
    <RuntimeDetailLayout title={task.data.name} editTo={`/form-demo/tasks/${id}/edit`}>
      <section className="runtime-details">
        <p>{task.data.description}</p>
        <Status value={task.data.status} />
        <p>Priority: {task.data.priority}</p>
        <h2>Execution profile</h2>
        <ProfileSummary id={task.data.executionProfileId} />
        <h2>Processes</h2>
        <ChildList>
          {processes.data?.map((process) => (
            <Link
              key={process.id}
              to="/form-demo/processes/$processId"
              params={{ processId: process.id }}
            >
              {process.name}
            </Link>
          ))}
        </ChildList>
      </section>
    </RuntimeDetailLayout>
  );
};

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
  const query = useTask(id);
  const profile = useExecutionProfile(query.data?.executionProfileId ?? "");

  const { entityForm, profileForm, save } = useTaskEditForms(id);

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
        navigate({ to: "/form-demo/tasks/$taskId", params: { taskId: id }, search: {} })
      }
    >
      <div className="runtime-editor-heading">
        <h1>Edit Task</h1>
      </div>
      <FormEditor.TabList>
        <FormEditor.TabTrigger name="entity" label="Task" />
        <FormEditor.TabTrigger name="profile" label="Execution Profile" />
      </FormEditor.TabList>
      <FormEditor.Tab name="entity">
        <TaskFields form={entityForm.form} />
      </FormEditor.Tab>
      <FormEditor.Tab name="profile">
        <ExecutionProfileFields form={profileForm.form} />
      </FormEditor.Tab>
      <FormEditor.Actions />
    </FormEditor.Provider>
  );
};
