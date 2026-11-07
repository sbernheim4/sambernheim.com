import { useWorkspaceRenderer } from "@features/Workspace/components/renderer";
import { useProcess } from "../hooks/useProcesses";
import { useThreads } from "@features/Threads/hooks/useThreads";
import { useTasks } from "@features/Tasks/hooks/useTasks";
import { parseUtcDate } from "@/utils";

export const ProcessDetail = ({ id }: { id: string }) => {
  const {
    Link,
    Section,
    Span,
    DetailLayout,
    DetailView,
    DetailProperties,
    ChildList,
    ProfileSummary,
    Status,
    Loading,
    Missing,
    DateTime,
  } = useWorkspaceRenderer();
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
              <Section className="details">
                <DetailProperties
                  properties={[
                    { label: "ID", value: process.data.id },
                    { label: "Name", value: process.data.name },
                    {
                      label: "Task ID",
                      value: task ? (
                        <>
                          {process.data.taskId}{" "}
                          <Link href={`/form-demo/tasks/${task.id}`}>({task.name})</Link>
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
                        <DateTime value={parseUtcDate(process.data.createdAt)} />
                      ) : (
                        "—"
                      ),
                    },
                    {
                      label: "Updated",
                      value: process.data.updatedAt ? (
                        <DateTime value={parseUtcDate(process.data.updatedAt)} />
                      ) : (
                        "—"
                      ),
                    },
                  ]}
                />
              </Section>
            ),
          },
          {
            value: "profile",
            label: "Execution Profile",
            children: (
              <Section className="details">
                <ProfileSummary id={process.data.executionProfileId} />
              </Section>
            ),
          },
          {
            value: "threads",
            label: "Threads",
            children: (
              <Section className="details">
                <ChildList>
                  {threads.data?.map((thread) => {
                    return (
                      <Link key={thread.id} href={`/form-demo/threads/${thread.id}`}>
                        <Span>{thread.name}</Span>
                        <Span className="relationship-meta">{thread.entryPoint}</Span>
                      </Link>
                    );
                  })}
                </ChildList>
              </Section>
            ),
          },
        ]}
      />
    </DetailLayout>
  );
};
