import { CommandLink as Link, useTasks } from "@/features";
import { EntityTable } from "@features/EntityTable/components/web/EntityTable";

export const TaskList = () => {
  const query = useTasks();

  return (
    <>
      <div className="heading">
        <h1>Tasks</h1>
        <Link className="primary-action" to="/form-demo/tasks/create">
          Create task
        </Link>
      </div>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <EntityTable
          data={(query.data ?? []).map((task) => ({
            id: task.id,
            name: task.name,
            status: task.status,
            summary: task.description,
            href: `/form-demo/tasks/${task.id}`,
          }))}
        />
      )}
    </>
  );
};
