import { CommandLink as Link } from "@/features";
import { useProcesses } from "@/features";
import { EntityTable } from "@features/EntityTable/components/web/EntityTable";

export const ProcessList = () => {
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
        <EntityTable
          data={(query.data ?? []).map((process) => ({
            id: process.id,
            name: process.name,
            status: process.status,
            summary: process.command,
            href: `/form-demo/processes/${process.id}`,
          }))}
        />
      )}
    </>
  );
};
