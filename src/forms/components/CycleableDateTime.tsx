import { format, formatDistanceToNow, isValid } from "date-fns";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../shared/components/ui/tooltip";

export type CycleableDateTimeMode = "utc" | "relative" | "local";

const modes: readonly CycleableDateTimeMode[] = ["utc", "relative", "local"];
const CycleableDateTimeContext = createContext<CycleableDateTimeMode>("utc");
const CycleableDateTimeModeContext = createContext<((mode: CycleableDateTimeMode) => void) | null>(
  null,
);

export const CycleableDateTimeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<CycleableDateTimeMode>("utc");

  return (
    <CycleableDateTimeContext.Provider value={mode}>
      <CycleableDateTimeModeContext.Provider value={setMode}>
        {children}
      </CycleableDateTimeModeContext.Provider>
    </CycleableDateTimeContext.Provider>
  );
};

const toDate = (value: Date | number | string) => {
  return value instanceof Date ? value : new Date(value);
};

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
}: {
  value: Date | number | string;
  className?: string;
}) => {
  const mode = useContext(CycleableDateTimeContext);
  const setMode = useContext(CycleableDateTimeModeContext);
  const [, refresh] = useState(0);
  const date = toDate(value);

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
    setMode?.(modes[(modes.indexOf(mode) + 1) % modes.length]);
  };

  const text = !isValid(date)
    ? "Invalid date"
    : mode === "utc"
      ? formatUtc(date)
      : mode === "relative"
        ? formatDistanceToNow(date, { addSuffix: true })
        : format(date, "PPpp");
  const formatLabel = mode === "utc" ? "UTC" : mode === "relative" ? "Relative" : "Local";
  const toggleHint = "Click to toggle between UTC, Local, and Relative.";
  const tooltip = `Format: ${formatLabel}. ${toggleHint}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={className ?? "cycleable-date-time"}
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
