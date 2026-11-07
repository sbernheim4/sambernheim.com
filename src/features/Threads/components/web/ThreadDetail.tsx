import {
  CommandLink as Link,
  useThread,
  useProcesses,
  Number as FormattedNumber,
  CycleableDateTime,
} from "@/features";
import { parseUtcDate } from "@/utils";
import { DetailLayout, Loading, Missing, Status } from "@features/Workspace/components/web/Layout";
import { DetailProperties, ProfileSummary } from "@features/Workspace/components/web/DetailHelpers";
import { DetailView } from "@features/Workspace/components/web/DetailView";

export const ThreadDetail = ({ id }: { id: string }) => {
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
    <DetailLayout title={thread.data.name} editTo={`/form-demo/threads/${id}/edit`}>
      <DetailView
        tabs={[
          {
            value: "overview",
            label: "Overview",
            children: (
              <section className="details">
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
                        <CycleableDateTime value={parseUtcDate(thread.data.createdAt)} />
                      ) : (
                        "—"
                      ),
                    },
                    {
                      label: "Updated",
                      value: thread.data.updatedAt ? (
                        <CycleableDateTime value={parseUtcDate(thread.data.updatedAt)} />
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
                <ProfileSummary id={thread.data.executionProfileId} />
              </section>
            ),
          },
          {
            value: "process",
            label: "Parent Process",
            children: (
              <section className="details">
                {process ? (
                  <Link to="/form-demo/processes/$processId" params={{ processId: process.id }}>
                    {process.name}
                  </Link>
                ) : (
                  <strong>{thread.data.processId}</strong>
                )}
              </section>
            ),
          },
        ]}
      />
    </DetailLayout>
  );
};
