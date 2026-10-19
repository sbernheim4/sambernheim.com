import {
  differenceInCalendarDays,
  differenceInMonths,
  differenceInYears,
  format,
  isValid,
} from "date-fns";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../shared/components/ui/tooltip";
import { useCycleableDateTimeMode } from "./CycleableDateTime";
import "./CycleableDate.css";

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

const formatRelativeDate = (date: Date) => {
  const now = new Date();
  const days = differenceInCalendarDays(now, date);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days === -1) return "Tomorrow";
  if (days > 1 && days < 30) return `${days} days ago`;
  if (days < -1 && days > -30) return `in ${Math.abs(days)} days`;

  const months = differenceInMonths(now, date);
  if (months >= 1 && months < 12) {
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  if (months <= -1 && months > -12) {
    const absoluteMonths = Math.abs(months);
    return `in ${absoluteMonths} ${absoluteMonths === 1 ? "month" : "months"}`;
  }

  const years = differenceInYears(now, date);
  if (years >= 1) return `${years} ${years === 1 ? "year" : "years"} ago`;
  if (years <= -1) {
    const absoluteYears = Math.abs(years);
    return `in ${absoluteYears} ${absoluteYears === 1 ? "year" : "years"}`;
  }

  return `${days} days ago`;
};

const parseDate = (value: Date | number | string) => {
  if (typeof value === "string") {
    const match = dateOnlyPattern.exec(value);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }

  return value instanceof Date ? value : new Date(value);
};

export const CycleableDate = ({
  value,
  className,
}: {
  value: Date | number | string;
  className?: string;
}) => {
  const { mode, setMode } = useCycleableDateTimeMode();
  const [, refresh] = useState(0);
  const relative = mode === "relative";
  const date = parseDate(value);
  const valid = isValid(date);
  const dateTime = valid
    ? typeof value === "string" && dateOnlyPattern.test(value)
      ? value
      : date.toISOString()
    : undefined;

  useEffect(() => {
    if (!relative) return;

    const timer = setInterval(() => {
      refresh((current) => current + 1);
    }, 60_000);
    return () => clearInterval(timer);
  }, [relative]);

  const text = !valid ? "Invalid date" : relative ? formatRelativeDate(date) : format(date, "PP");
  const formatLabel = relative ? "Relative" : "Date";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`cycleable-date${className ? ` ${className}` : ""}`}
          onClick={() => setMode?.(relative ? "utc" : "relative")}
          aria-label={`${text}. Format: ${formatLabel}. Click to toggle between Date and Relative.`}
          data-mode={relative ? "relative" : "date"}
        >
          <time dateTime={dateTime}>{text}</time>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <span className="cycleable-date-tooltip-line">Format: {formatLabel}</span>
        <span className="cycleable-date-tooltip-line">
          Click to toggle between Date and Relative.
        </span>
      </TooltipContent>
    </Tooltip>
  );
};
