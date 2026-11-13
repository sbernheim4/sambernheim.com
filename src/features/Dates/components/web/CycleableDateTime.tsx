import { formatCycleableDateTime, getCycleableDateTimeAttribute } from "../../format";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../UI/components/ui/tooltip";
import {
  cycleableDateTimeModes,
  getNextCycleableDateTimeMode,
  resolveCycleableDateTimeMode,
  useCycleableDateTimeMode,
  type CycleableDateTimeMode,
} from "../../hooks/useCycleableDateTimeMode";
import { useRelativeDateRefresh } from "../../hooks/useRelativeDateRefresh";

export const CycleableDateTime = ({
  value,
  className,
  modes: availableModes = cycleableDateTimeModes,
}: {
  value: Date;
  className?: string;
  modes?: readonly CycleableDateTimeMode[];
}) => {
  const { mode: contextMode, setMode } = useCycleableDateTimeMode();
  const date = value;
  const mode = resolveCycleableDateTimeMode(contextMode, availableModes);
  useRelativeDateRefresh(mode === "relative", 30_000);

  const nextMode = () => {
    setMode?.(getNextCycleableDateTimeMode(mode, availableModes));
  };

  const text = formatCycleableDateTime(date, mode);
  const formatLabel = mode === "utc" ? "UTC" : mode === "relative" ? "Relative" : "Local";
  const toggleHint =
    availableModes.length === 3
      ? "Click to toggle between UTC, Local, and Relative."
      : `Click to toggle between ${availableModes
          .map((availableMode) => {
            return availableMode === "utc"
              ? "Absolute"
              : availableMode[0].toUpperCase() + availableMode.slice(1);
          })
          .join(", ")}.`;
  const tooltip = `Format: ${formatLabel}. ${toggleHint}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`cycleable-date-time${className ? ` ${className}` : ""}`}
          onClick={nextMode}
          aria-label={`${text}. ${tooltip}`}
          data-mode={mode}
        >
          <time dateTime={getCycleableDateTimeAttribute(date)}>{text}</time>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <span className="cycleable-date-time-tooltip-line">Format: {formatLabel}</span>
        <span className="cycleable-date-time-tooltip-line">{toggleHint}</span>
      </TooltipContent>
    </Tooltip>
  );
};
