import { useWorkspaceRenderer } from "@features/Workspace/components/renderer";
import { useThread } from "../hooks/useThreads";
import { useProcesses } from "@features/Processes/hooks/useProcesses";
import { parseUtcDate } from "@/utils";

export const ThreadDetail = ({ id }: { id: string }) => {
  const {
    Link,
    Section,
    DetailLayout,
    DetailView,
    DetailProperties,
    ProfileSummary,
    Status,
    Loading,
    Missing,
    DateTime,
    Number: FormattedNumber,
  } = useWorkspaceRenderer();
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
    <DetailLayout title={thread.data.name} editTo={`/experiments/workspace/threads/${id}/edit`}>
      <DetailView
        tabs={[
          {
            value: "overview",
            label: "Overview",
            children: (
              <Section className="details">
                <DetailProperties
                  properties={[
                    { label: "ID", value: thread.data.id },
                    { label: "Name", value: thread.data.name },
                    { label: "Entry point", value: thread.data.entryPoint },
                    { label: "Status", value: <Status value={thread.data.status} /> },
                    { label: "Priority", value: <FormattedNumber value={thread.data.priority} /> },
                    { label: "Process ID", value: thread.data.processId },
                    { label: "Execution profile ID", value: thread.data.executionProfileId },
                    {
                      label: "Created",
                      value: thread.data.createdAt ? (
                        <DateTime value={parseUtcDate(thread.data.createdAt)} />
                      ) : (
                        "—"
                      ),
                    },
                    {
                      label: "Updated",
                      value: thread.data.updatedAt ? (
                        <DateTime value={parseUtcDate(thread.data.updatedAt)} />
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
                <ProfileSummary id={thread.data.executionProfileId} />
              </Section>
            ),
          },
          {
            value: "process",
            label: "Parent Process",
            children: (
              <Section className="details">
                {process ? (
                  <Link href={`/experiments/workspace/processes/${process.id}`}>
                    {process.name}
                  </Link>
                ) : (
                  <strong>{thread.data.processId}</strong>
                )}
              </Section>
            ),
          },
        ]}
      />
    </DetailLayout>
  );
};
