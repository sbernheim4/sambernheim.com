import { CommandLink as Link, useThreads } from "@/features";
import { EntityTable } from "@features/EntityTable/components/web/EntityTable";

export const ThreadList = () => {
  const query = useThreads();

  return (
    <>
      <div className="heading">
        <h1>Threads</h1>
        <Link className="primary-action" to="/form-demo/threads/create">
          Create thread
        </Link>
      </div>
      {query.isPending ? (
        <p>Loading...</p>
      ) : (
        <EntityTable
          data={(query.data ?? []).map((thread) => ({
            id: thread.id,
            name: thread.name,
            status: thread.status,
            summary: thread.entryPoint,
            href: `/form-demo/threads/${thread.id}`,
          }))}
        />
      )}
    </>
  );
};
