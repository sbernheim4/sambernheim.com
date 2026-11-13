import type { TableModel, TableRecord } from "./model";

export type TableProps = {
  model: TableModel;
  interactive?: boolean;
  onSelect?: (record: TableRecord) => void;
};
