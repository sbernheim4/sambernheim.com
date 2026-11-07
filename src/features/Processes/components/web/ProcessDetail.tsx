import { CommandLink as Link } from "@/features";
import { useProcess, useProcesses } from "@/features";
import { useThreads } from "@/features";
import { useTasks } from "@/features";
import { CycleableDateTime } from "@/features";
import { parseUtcDate } from "@/utils";
import { DetailLayout, Loading, Missing, Status } from "@features/Workspace/components/web/Layout";
import {
  ChildList,
  DetailProperties,
  ProfileSummary,
} from "@features/Workspace/components/web/DetailHelpers";
import { DetailView } from "@features/Workspace/components/web/DetailView";

export const ProcessDetail = ({ id }: { id: string }) => {
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
