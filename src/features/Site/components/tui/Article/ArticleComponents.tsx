import { useIsFetching, useQuery } from "@tanstack/react-query";
import {
  differenceInCalendarDays,
  differenceInMonths,
  differenceInYears,
  format,
  formatDistanceToNow,
  isValid,
} from "date-fns";
import { Box, Text } from "ink";
import { useEffect, useState, type ReactNode } from "react";
import { useAutomaticCommandAction } from "@features/Commands/commands";
import {
  useCycleableDateTimeMode,
  type CycleableDateTimeMode,
} from "@features/Dates/hooks/useCycleableDateTimeMode";
import { useArticleControl } from "./ArticleFocus";

const ArticleControl = ({
  label,
  onActivate,
  children,
  selected = false,
  disabled = false,
}: {
  label: string;
  onActivate: () => void;
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
}) => {
  const activate = () => {
    if (!disabled) {
      onActivate();
    }
  };
  const { focused, ref } = useArticleControl({ label, onActivate: activate });
  useAutomaticCommandAction({
    kind: "article-control",
    label,
    command: { group: "Article examples", enabled: !disabled },
    execute: activate,
  });

  return (
    <Box ref={ref}>
      <Text inverse={focused} bold={selected} dimColor={disabled}>
        {focused ? "› " : "  "}
        {children}
        {focused && !disabled ? " · Enter" : ""}
      </Text>
    </Box>
  );
};

const useRelativeRefresh = (relative: boolean, interval: number) => {
  const [, refresh] = useState(0);
  useEffect(() => {
    if (!relative) {
      return;
    }
    const timer = setInterval(() => {
      refresh((current) => {
        return current + 1;
      });
    }, interval);
    return () => {
      clearInterval(timer);
    };
  }, [relative, interval]);
};

const parseDate = (value: Date | string | number) => {
  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }
  return value instanceof Date ? value : new Date(value);
};

const formatRelativeDate = (date: Date) => {
  const now = new Date();
  const days = differenceInCalendarDays(now, date);
  if (days === 0) {
    return "Today";
  }
  if (days === 1) {
    return "Yesterday";
  }
  if (days === -1) {
    return "Tomorrow";
  }
  if (days > 1 && days < 30) {
    return `${days} days ago`;
  }
  if (days < -1 && days > -30) {
    return `in ${Math.abs(days)} days`;
  }
  const months = differenceInMonths(now, date);
  if (months >= 1 && months < 12) {
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  if (months <= -1 && months > -12) {
    const absoluteMonths = Math.abs(months);
    return `in ${absoluteMonths} ${absoluteMonths === 1 ? "month" : "months"}`;
  }
  const years = differenceInYears(now, date);
  if (years >= 1) {
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
  if (years <= -1) {
    const absoluteYears = Math.abs(years);
    return `in ${absoluteYears} ${absoluteYears === 1 ? "year" : "years"}`;
  }
  return `${days} days ago`;
};

const CycleableDate = ({ value }: { value: Date | string | number; className?: string }) => {
  const { mode, setMode } = useCycleableDateTimeMode();
  const relative = mode === "relative";
  useRelativeRefresh(relative, 60_000);
  const date = parseDate(value);
  const text = !isValid(date)
    ? "Invalid date"
    : relative
      ? formatRelativeDate(date)
      : format(date, "PP");
  return (
    <ArticleControl
      label={`Cycle date format: ${text}`}
      onActivate={() => {
        setMode?.(relative ? "utc" : "relative");
      }}
    >
      {text} [{relative ? "Relative" : "Date"}]
    </ArticleControl>
  );
};

const dateTimeModes: readonly CycleableDateTimeMode[] = ["utc", "relative", "local"];

const CycleableDateTime = ({
  value,
  modes = dateTimeModes,
}: {
  value?: Date | string | number;
  className?: string;
  modes?: readonly CycleableDateTimeMode[];
}) => {
  const { mode: contextMode, setMode } = useCycleableDateTimeMode();
  const mode = modes.includes(contextMode) ? contextMode : (modes[0] ?? "utc");
  // The introductory article example omits a value; keep its timestamp stable.
  const [defaultDate] = useState(() => {
    return new Date();
  });
  const date = value === undefined ? defaultDate : parseDate(value);
  useRelativeRefresh(mode === "relative", 30_000);
  const text = !isValid(date)
    ? "Invalid date"
    : mode === "relative"
      ? formatDistanceToNow(date, { addSuffix: true })
      : mode === "local"
        ? format(date, "PPpp")
        : new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "medium",
            timeZone: "UTC",
          }).format(date);
  return (
    <ArticleControl
      label={`Cycle date/time format: ${text}`}
      onActivate={() => {
        setMode?.(modes[(modes.indexOf(mode) + 1) % modes.length] ?? "utc");
      }}
    >
      {text} [{mode === "utc" ? "UTC" : mode === "relative" ? "Relative" : "Local"}]
    </ArticleControl>
  );
};

const FakeLoader = () => {
  const fakeQuery = useQuery({
    queryKey: ["ux-demo"],
    queryFn: () => {
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve("DONE");
        }, 3000);
      });
    },
    enabled: false,
  });
  return (
    <ArticleControl
      label="Refetch article demo query"
      disabled={fakeQuery.isFetching}
      onActivate={() => {
        void fakeQuery.refetch();
      }}
    >
      {fakeQuery.isFetching ? "Loading..." : "Activate to fire a refetch"}
    </ArticleControl>
  );
};

const FakeGlobalQueryLoader = () => {
  const isFetching = useIsFetching() > 0;
  if (!isFetching) {
    return null;
  }
  return (
    <Box>
      <Text color="yellow">Loading...</Text>
    </Box>
  );
};

const detailTabs = ["Overview", "Activity", "Settings"] as const;

const EntityDetailDensityExample = () => {
  const [tab, setTab] = useState<(typeof detailTabs)[number]>("Overview");
  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Box flexWrap="wrap" columnGap={1}>
        {detailTabs.map((label) => {
          return (
            <ArticleControl
              key={label}
              label={`Acme Workspace: ${label}`}
              selected={tab === label}
              onActivate={() => {
                setTab(label);
              }}
            >
              {tab === label ? `[${label}]` : label}
            </ArticleControl>
          );
        })}
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {tab === "Overview" && (
          <>
            <Text bold>Acme Workspace</Text>
            <Text>Active customer workspace with 24 members.</Text>
            <Text dimColor>Created</Text>
            <CycleableDate value={new Date("2024-06-04T00:00:00.000Z")} />
          </>
        )}
        {tab === "Activity" && (
          <>
            <Text>Last deployment succeeded</Text>
            <CycleableDateTime value={new Date("2026-10-18T18:00:00.000Z")} />
          </>
        )}
        {tab === "Settings" && (
          <>
            <Text>Region: us-east-1</Text>
            <Text>Retention: 30 days</Text>
          </>
        )}
      </Box>
    </Box>
  );
};

export const articleComponents = {
  CycleableDate,
  CycleableDateTime,
  FakeLoader,
  FakeGlobalQueryLoader,
  EntityDetailDensityExample,
};
