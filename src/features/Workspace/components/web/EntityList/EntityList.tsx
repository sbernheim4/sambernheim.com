import { CommandLink } from "@/features";
import { useTableModel } from "@features/Table/model";
import { Table } from "@features/Table/components/web/Table";
import type { WorkspaceRenderer } from "../../renderer";
export const EntityList: WorkspaceRenderer["EntityList"] = ({
  title,
  createHref,
  createLabel,
  data,
  loading,
}) => {
  const model = useTableModel(data);
  return (
    <>
      <div className="heading">
        <h1>{title}</h1>
        <CommandLink className="primary-action" to={createHref}>
          {createLabel}
        </CommandLink>
      </div>
      {loading ? <p>Loading...</p> : <Table model={model} />}
    </>
  );
};
