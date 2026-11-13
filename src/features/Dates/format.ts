import { format, formatDistanceToNow, isValid } from "date-fns";
import type { CycleableDateTimeMode } from "./hooks/useCycleableDateTimeMode";

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseCycleableDate = (value: Date | number | string) => {
  if (typeof value === "string") {
    const match = dateOnlyPattern.exec(value);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }

  return value instanceof Date ? value : new Date(value);
};

export const getCycleableDateTimeAttribute = (value: Date | number | string) => {
  const date = parseCycleableDate(value);
  if (!isValid(date)) {
    return undefined;
  }
  return typeof value === "string" && dateOnlyPattern.test(value) ? value : date.toISOString();
};

export const formatCycleableDate = (value: Date | number | string, relative: boolean) => {
  const date = parseCycleableDate(value);
  if (!isValid(date)) {
    return "Invalid date";
  }
  return relative ? formatDistanceToNow(date, { addSuffix: true }) : format(date, "PP");
};

const formatUtcDateTime = (date: Date) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "UTC",
  }).format(date);
};

export const formatCycleableDateTime = (date: Date, mode: CycleableDateTimeMode) => {
  if (!isValid(date)) {
    return "Invalid date";
  }
  if (mode === "relative") {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  if (mode === "local") {
    return format(date, "PPpp");
  }
  return formatUtcDateTime(date);
};
