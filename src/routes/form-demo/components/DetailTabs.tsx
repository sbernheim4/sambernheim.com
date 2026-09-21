import type { ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import "./DetailTabs.css";

export type DetailTab = {
  value: string;
  label: string;
  children: ReactNode;
};

export const DetailTabs = ({ tabs }: { tabs: readonly DetailTab[] }) => {
  return (
    <Tabs.Root className="detail-tabs" defaultValue={tabs[0]?.value}>
      <Tabs.List className="detail-tab-list" aria-label="Entity details">
        {tabs.map((tab) => {
          return (
            <Tabs.Trigger className="detail-tab-trigger" key={tab.value} value={tab.value}>
              {tab.label}
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>
      {tabs.map((tab) => {
        return (
          <Tabs.Content className="detail-tab-content" key={tab.value} value={tab.value}>
            {tab.children}
          </Tabs.Content>
        );
      })}
    </Tabs.Root>
  );
};
