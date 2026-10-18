import { differenceInYears, format, isValid } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../shared/components/ui/tooltip";
import { useCycleableDateTimeMode } from "./CycleableDateTime";
import "./CycleableDate.css";

export const CycleableDate = ({
  value,
  className,
}: {
  value: Date | number | string;
  className?: string;
}) => {
  const { mode, setMode } = useCycleableDateTimeMode();
  const relative = mode === "relative";
  const date = value instanceof Date ? value : new Date(value);
  const valid = isValid(date);
  const years = valid ? differenceInYears(new Date(), date) : 0;
  const text = !valid
    ? "Invalid date"
    : relative
      ? `${years} ${years === 1 ? "year" : "years"} ago`
      : format(date, "PP");
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
          <time dateTime={valid ? date.toISOString() : undefined}>{text}</time>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <span className="cycleable-date-tooltip-line">Format: {formatLabel}</span>
        <span className="cycleable-date-tooltip-line">Click to toggle between Date and Relative.</span>
      </TooltipContent>
    </Tooltip>
  );
};
