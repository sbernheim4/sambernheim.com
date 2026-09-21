import { Link, useNavigate } from "@tanstack/react-router";
import { FormEditor } from "../../forms/components";
import { ExecutionProfileFields } from "../../domains/execution-profiles/components/ExecutionProfileFields";
import { useTasks, useTask } from "../../domains/tasks/hooks/useTasks";
import { useTaskEditForms } from "../../domains/tasks/hooks/useTaskEditForms";
import { useProcesses } from "../../domains/processes/hooks/useProcesses";
import { useExecutionProfile } from "../../domains/execution-profiles/hooks/useExecutionProfile";
import { TaskFields } from "../../domains/tasks/components/TaskFields";
import { DetailLayout, Loading, Missing, Status } from "../form-demo/components/Layout";
import { ChildList, ProfileSummary } from "../form-demo/components/DetailHelpers";
import { DetailView } from "../form-demo/components/DetailView";
import { ViewModePicker, useViewModePreference } from "../form-demo/components/ViewModePreference";

export const TaskListPage = () => {
  const query = useTasks();

  return (
    <>
      <h1>Tasks</h1>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <div className="list">
          {query.data?.map((task) => (
            <Link
              key={task.id}
              className="card"
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
    <DetailLayout title={task.data.name} editTo={`/form-demo/tasks/${id}/edit`}>
      <DetailView
        tabs={[
          {
            value: "overview",
            label: "Overview",
            children: (
              <section className="details">
                <div className="summary-grid">
                  <div>
                    <span className="eyebrow">Description</span>
                    <p>{task.data.description}</p>
                  </div>
                  <div>
                    <span className="eyebrow">Priority</span>
                    <strong>{task.data.priority}</strong>
                  </div>
                  <div>
                    <span className="eyebrow">Status</span>
                    <Status value={task.data.status} />
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
                <ProfileSummary id={task.data.executionProfileId} />
              </section>
            ),
          },
          {
            value: "processes",
            label: "Processes",
            children: (
              <section className="details">
                <ChildList>
                  {processes.data?.map((process) => (
                    <Link
                      key={process.id}
                      to="/form-demo/processes/$processId"
                      params={{ processId: process.id }}
                    >
                      <span>{process.name}</span>
                      <span className="relationship-meta">{process.command}</span>
                    </Link>
                  ))}
                </ChildList>
              </section>
            ),
          },
        ]}
      />
    </DetailLayout>
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
  const { mode, updateMode } = useViewModePreference();

  const { entityForm, profileForm, save } = useTaskEditForms(id);

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
      onCancel={() =>
        navigate({ to: "/form-demo/tasks/$taskId", params: { taskId: id }, search: {} })
      }
    >
      <div className="editor-heading">
        <h1>Edit Task</h1>
        <ViewModePicker mode={mode} onChange={updateMode} />
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
