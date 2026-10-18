import { useNavigate } from "@tanstack/react-router";
import { CommandLink as Link } from "../../shared/components/CommandLink";
import { FormEditor } from "../../forms/components";
import { ExecutionProfileFields } from "../../domains/execution-profiles/components/ExecutionProfileFields";
import { useProcesses, useProcess } from "../../domains/processes/hooks/useProcesses";
import { useProcessEditForms } from "../../domains/processes/hooks/useProcessEditForms";
import { useProcessCreateForms } from "../../domains/processes/hooks/useProcessCreateForms";
import { useThreads } from "../../domains/threads/hooks/useThreads";
import { useTasks } from "../../domains/tasks/hooks/useTasks";
import { useExecutionProfile } from "../../domains/execution-profiles/hooks/useExecutionProfile";
import { ProcessFields } from "../../domains/processes/components/ProcessFields";
import { DetailLayout, Loading, Missing, Status } from "../form-demo/components/Layout";
import { ChildList, DetailProperties, ProfileSummary } from "../form-demo/components/DetailHelpers";
import { DetailView } from "../form-demo/components/DetailView";
import { ViewModePicker, useViewModePreference } from "../form-demo/components/ViewModePreference";
import { CycleableDateTime } from "../../forms/components";
import { parseUtcDate } from "../../shared/date";
export const ProcessListPage = () => {
  const query = useProcesses();

  return (
    <>
      <div className="heading">
        <h1>Processes</h1>
        <Link className="primary-action" to="/form-demo/processes/create">
          Create process
        </Link>
      </div>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <div className="list">
          {query.data?.map((process) => {
            return (
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
            );
          })}
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

  const task = tasks.data?.find((item) => {
    return item.id === process.data?.taskId;
  });

  return (
    <DetailLayout title={process.data.name} editTo={`/form-demo/processes/${id}/edit`}>
      <DetailView
        tabs={[
          {
            value: "overview",
            label: "Overview",
            children: (
              <section className="details">
                <DetailProperties
                  properties={[
                    { label: "ID", value: process.data.id },
                    { label: "Name", value: process.data.name },
                    {
                      label: "Task ID",
                      value: task ? (
                        <>
                          {process.data.taskId}{" "}
                          <Link to="/form-demo/tasks/$taskId" params={{ taskId: task.id }}>
                            ({task.name})
                          </Link>
                        </>
                      ) : (
                        process.data.taskId
                      ),
                    },
                    { label: "Command", value: process.data.command },
                    { label: "Status", value: <Status value={process.data.status} /> },
                    { label: "Execution profile ID", value: process.data.executionProfileId },
                    {
                      label: "Created",
                      value: process.data.createdAt ? (
                        <CycleableDateTime value={parseUtcDate(process.data.createdAt)} />
                      ) : (
                        "—"
                      ),
                    },
                    {
                      label: "Updated",
                      value: process.data.updatedAt ? (
                        <CycleableDateTime value={parseUtcDate(process.data.updatedAt)} />
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
                <ProfileSummary id={process.data.executionProfileId} />
              </section>
            ),
          },
          {
            value: "threads",
            label: "Threads",
            children: (
              <section className="details">
                <ChildList>
                  {threads.data?.map((thread) => {
                    return (
                      <Link
                        key={thread.id}
                        to="/form-demo/threads/$threadId"
                        params={{ threadId: thread.id }}
                      >
                        <span>{thread.name}</span>
                        <span className="relationship-meta">{thread.entryPoint}</span>
                      </Link>
                    );
                  })}
                </ChildList>
              </section>
            ),
          },
        ]}
      />
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
      <div className="editor-heading">
        <h1>Edit Process</h1>
      </div>
      <div className="form-editor-view-mode-toolbar">
        <ViewModePicker mode={mode} onChange={updateMode} />
      </div>
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
      <div className="editor-heading">
        <h1>Create Process</h1>
      </div>
      <div className="form-editor-view-mode-toolbar">
        <ViewModePicker mode={mode} onChange={updateMode} />
      </div>
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
