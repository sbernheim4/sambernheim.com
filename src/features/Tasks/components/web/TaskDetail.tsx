import {
  CommandLink as Link,
  useTask,
  useProcesses,
  Number as FormattedNumber,
  CycleableDateTime,
} from "@/features";
import { parseUtcDate } from "@/utils";
import { DetailLayout, Loading, Missing, Status } from "@features/Workspace/components/web/Layout";
import {
  ChildList,
  DetailProperties,
  ProfileSummary,
} from "@features/Workspace/components/web/DetailHelpers";
import { DetailView } from "@features/Workspace/components/web/DetailView";

export const TaskDetail = ({ id }: { id: string }) => {
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
                        <CycleableDateTime value={parseUtcDate(task.data.createdAt)} />
                      ) : (
                        "—"
                      ),
                    },
                    {
                      label: "Updated",
                      value: task.data.updatedAt ? (
                        <CycleableDateTime value={parseUtcDate(task.data.updatedAt)} />
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
                  {processes.data?.map((process) => {
                    return (
                      <Link
                        key={process.id}
                        to="/form-demo/processes/$processId"
                        params={{ processId: process.id }}
                      >
                        <span>{process.name}</span>
                        <span className="relationship-meta">{process.command}</span>
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
