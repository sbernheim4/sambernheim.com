import { format, formatDistanceToNow, isValid } from "date-fns";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../UI/components/ui/tooltip";
import {
  useCycleableDateTimeMode,
  type CycleableDateTimeMode,
} from "../hooks/useCycleableDateTimeMode";

const modes: readonly CycleableDateTimeMode[] = ["utc", "relative", "local"];

const formatUtc = (date: Date) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "UTC",
  }).format(date);
};

export const CycleableDateTime = ({
  value,
  className,
  modes: availableModes = modes,
}: {
  value: Date;
  className?: string;
  modes?: readonly CycleableDateTimeMode[];
}) => {
  const { mode: contextMode, setMode } = useCycleableDateTimeMode();
  const [, refresh] = useState(0);
  const date = value;
  const mode = availableModes.includes(contextMode) ? contextMode : (availableModes[0] ?? "utc");

  useEffect(() => {
    if (mode !== "relative") {
      return;
    }

    const timer = setInterval(() => {
      refresh((current) => {
        return current + 1;
      });
    }, 30_000);
    return () => {
      clearInterval(timer);
    };
  }, [mode]);

  const nextMode = () => {
    setMode?.(availableModes[(availableModes.indexOf(mode) + 1) % availableModes.length] ?? "utc");
  };

  const text = !isValid(date)
    ? "Invalid date"
    : mode === "utc"
      ? formatUtc(date)
      : mode === "relative"
        ? formatDistanceToNow(date, { addSuffix: true })
        : format(date, "PPpp");
  const formatLabel = mode === "utc" ? "UTC" : mode === "relative" ? "Relative" : "Local";
  const toggleHint =
    availableModes.length === 3
      ? "Click to toggle between UTC, Local, and Relative."
      : `Click to toggle between ${availableModes
          .map((availableMode) =>
            availableMode === "utc"
              ? "Absolute"
              : availableMode[0].toUpperCase() + availableMode.slice(1),
          )
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
          <time dateTime={isValid(date) ? date.toISOString() : undefined}>{text}</time>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <span className="cycleable-date-time-tooltip-line">Format: {formatLabel}</span>
        <span className="cycleable-date-time-tooltip-line">{toggleHint}</span>
      </TooltipContent>
    </Tooltip>
  );
};
