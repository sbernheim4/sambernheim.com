import { useIsFetching, useQuery } from "@tanstack/react-query";
import { Box, Text } from "ink";
import { useState, type ReactNode } from "react";
import { useAutomaticCommandAction } from "@features/CommandPalette/model";
import { formatCycleableDateTime, parseCycleableDate } from "@features/Dates/format";
import {
  cycleableDateTimeModes,
  getNextCycleableDateTimeMode,
  resolveCycleableDateTimeMode,
  useCycleableDateTimeMode,
  type CycleableDateTimeMode,
} from "@features/Dates/hooks/useCycleableDateTimeMode";
import { useCycleableDateModel } from "@features/Dates/hooks/useCycleableDateModel";
import { useRelativeDateRefresh } from "@features/Dates/hooks/useRelativeDateRefresh";
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

const CycleableDate = ({ value }: { value: Date | string | number; className?: string }) => {
  const { text, formatLabel, cycleMode } = useCycleableDateModel(value);
  return (
    <ArticleControl label={`Cycle date format: ${text}`} onActivate={cycleMode}>
      {text} [{formatLabel}]
    </ArticleControl>
  );
};

const CycleableDateTime = ({
  value,
  modes = cycleableDateTimeModes,
}: {
  value?: Date | string | number;
  className?: string;
  modes?: readonly CycleableDateTimeMode[];
}) => {
  const { mode: contextMode, setMode } = useCycleableDateTimeMode();
  const mode = resolveCycleableDateTimeMode(contextMode, modes);
  // The introductory article example omits a value; keep its timestamp stable.
  const [defaultDate] = useState(() => {
    return new Date();
  });
  const date = value === undefined ? defaultDate : parseCycleableDate(value);
  useRelativeDateRefresh(mode === "relative", 30_000);
  const text = formatCycleableDateTime(date, mode);
  return (
    <ArticleControl
      label={`Cycle date/time format: ${text}`}
      onActivate={() => {
        setMode?.(getNextCycleableDateTimeMode(mode, modes));
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
