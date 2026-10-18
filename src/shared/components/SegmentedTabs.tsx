import { useRef, useState, type ComponentType, type ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import "./SegmentedTabs.css";
import {
  getCommandLabel,
  useAutomaticCommandAction,
  type CommandOverride,
} from "../commands/commands";

export type SegmentedTab = {
  value: string;
  label: string;
  children: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
  command?: CommandOverride;
};

export const SegmentedTabList = ({
  children,
  ariaLabel = "Tabs",
  className,
}: {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}) => {
  return (
    <Tabs.List className={className ?? "segmented-tabs-list"} aria-label={ariaLabel}>
      {children}
    </Tabs.List>
  );
};

export const SegmentedTabTrigger = ({
  value,
  children,
  icon: Icon,
  disabled,
  className,
  onClick,
  command,
  onCommand,
}: {
  value: string;
  children: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  command?: CommandOverride;
  onCommand?: () => void;
}) => {
  const label = getCommandLabel(children);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useAutomaticCommandAction({
    kind: "tab",
    label,
    command: command === false ? false : { ...command, enabled: command?.enabled ?? !disabled },
    execute: () => {
      if (onCommand) {
        onCommand();
      } else {
        triggerRef.current?.click();
      }
    },
  });

  return (
    <Tabs.Trigger
      ref={triggerRef}
      value={value}
      className={className ?? "segmented-tab-trigger"}
      disabled={disabled}
      onClick={onClick}
    >
      {Icon && <Icon className="segmented-tab-icon" />}
      {children}
    </Tabs.Trigger>
  );
};

export const SegmentedTabContent = ({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <Tabs.Content
      value={value}
      className={className ? `segmented-tab-content ${className}` : "segmented-tab-content"}
    >
      {children}
    </Tabs.Content>
  );
};

export const SegmentedTabs = ({
  tabs,
  ariaLabel = "Tabs",
  className,
}: {
  tabs: readonly SegmentedTab[];
  ariaLabel?: string;
  className?: string;
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value);

  return (
    <Tabs.Root
      className={className ?? "segmented-tabs"}
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <SegmentedTabList ariaLabel={ariaLabel}>
        {tabs.map((tab) => {
          return (
            <SegmentedTabTrigger
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              disabled={tab.disabled}
              command={tab.command}
              onCommand={() => {
                setActiveTab(tab.value);
              }}
            >
              {tab.label}
            </SegmentedTabTrigger>
          );
        })}
      </SegmentedTabList>
      {tabs.map((tab) => {
        return (
          <SegmentedTabContent key={tab.value} value={tab.value}>
            {tab.children}
          </SegmentedTabContent>
        );
      })}
    </Tabs.Root>
  );
};
