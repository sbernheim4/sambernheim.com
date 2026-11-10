import { useWorkspaceRenderer } from "@features/Workspace/components/renderer";
import { useTask } from "../hooks/useTasks";
import { useProcesses } from "@features/Processes/hooks/useProcesses";
import { parseUtcDate } from "@/utils";

export const TaskDetail = ({ id }: { id: string }) => {
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
    Number: FormattedNumber,
  } = useWorkspaceRenderer();
  const task = useTask(id);
  const processes = useProcesses(id);
  if (task.isPending) {
    return <Loading />;
  }

  if (!task.data) {
    return <Missing />;
  }

  return (
    <DetailLayout title={task.data.name} editTo={`/experiments/workspace/tasks/${id}/edit`}>
      <DetailView
        tabs={[
          {
            value: "overview",
            label: "Overview",
            children: (
              <Section className="details">
                <DetailProperties
                  properties={[
                    { label: "ID", value: task.data.id },
                    { label: "Name", value: task.data.name },
                    { label: "Description", value: task.data.description },
                    { label: "Status", value: <Status value={task.data.status} /> },
                    { label: "Priority", value: <FormattedNumber value={task.data.priority} /> },
                    { label: "Execution profile ID", value: task.data.executionProfileId },
                    {
                      label: "Created",
                      value: task.data.createdAt ? (
                        <DateTime value={parseUtcDate(task.data.createdAt)} />
                      ) : (
                        "—"
                      ),
                    },
                    {
                      label: "Updated",
                      value: task.data.updatedAt ? (
                        <DateTime value={parseUtcDate(task.data.updatedAt)} />
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
                <ProfileSummary id={task.data.executionProfileId} />
              </Section>
            ),
          },
          {
            value: "processes",
            label: "Processes",
            children: (
              <Section className="details">
                <ChildList>
                  {processes.data?.map((process) => {
                    return (
                      <Link
                        key={process.id}
                        href={`/experiments/workspace/processes/${process.id}`}
                      >
                        <Span>{process.name}</Span>
                        <Span className="relationship-meta">{process.command}</Span>
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
