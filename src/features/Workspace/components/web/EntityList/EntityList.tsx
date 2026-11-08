import { CommandLink } from "@/features";
import { EntityTable } from "@features/EntityTable/components/web/EntityTable";
import type { WorkspaceRenderer } from "../../renderer";
export const EntityList: WorkspaceRenderer["EntityList"] = ({
  title,
  createHref,
  createLabel,
  data,
  loading,
}) => {
  return (
    <>
      <div className="heading">
        <h1>{title}</h1>
        <CommandLink className="primary-action" to={createHref}>
          {createLabel}
        </CommandLink>
      </div>
      {loading ? <p>Loading...</p> : <EntityTable data={data} />}
    </>
  );
};
