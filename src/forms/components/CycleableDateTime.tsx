import { format, formatDistanceToNow, isValid } from "date-fns";
import { useEffect, useState } from "react";

type DisplayMode = "utc" | "local" | "relative";

const modes: readonly DisplayMode[] = ["utc", "local", "relative"];

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
  const [mode, setMode] = useState<DisplayMode>("utc");
  const [, refresh] = useState(0);
  const date = toDate(value);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";

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
    setMode((current) => {
      return modes[(modes.indexOf(current) + 1) % modes.length];
    });
  };

  const text = !isValid(date)
    ? "Invalid date"
    : mode === "utc"
      ? formatUtc(date)
      : mode === "local"
        ? format(date, "PPpp")
        : formatDistanceToNow(date, { addSuffix: true });
  const modeLabel = mode === "utc" ? "UTC" : mode === "local" ? userTimeZone : "Relative time";

  return (
    <button
      type="button"
      className={className ?? "cycleable-date-time"}
      onClick={nextMode}
      title={`Display mode: ${modeLabel}. Click to change.`}
      aria-label={`${text}. Display mode: ${modeLabel}. Click to change.`}
      data-mode={mode}
    >
      <time dateTime={isValid(date) ? date.toISOString() : undefined}>{text}</time>
    </button>
  );
};
