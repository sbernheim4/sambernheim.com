import { formatCycleableDate, getCycleableDateTimeAttribute } from "../format";
import {
  cycleableDateModes,
  getNextCycleableDateTimeMode,
  useCycleableDateTimeMode,
} from "./useCycleableDateTimeMode";
import { useRelativeDateRefresh } from "./useRelativeDateRefresh";

export const useCycleableDateModel = (value: Date | number | string) => {
  const { mode, setMode } = useCycleableDateTimeMode();
  const relative = mode === "relative";
  const text = formatCycleableDate(value, relative);
  const formatLabel = relative ? "Relative" : "Date";
  const dateTime = getCycleableDateTimeAttribute(value);

  useRelativeDateRefresh(relative, 60_000);

  const cycleMode = () => {
    setMode?.(getNextCycleableDateTimeMode(mode, cycleableDateModes));
  };

  return { mode, relative, text, formatLabel, dateTime, cycleMode };
};
