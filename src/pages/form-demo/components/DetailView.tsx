import { useState } from "react";
import type { DetailTab } from "./DetailTabs";
import { DetailTabs } from "./DetailTabs";
import { DetailSection } from "./DetailSection";
import { ViewModePicker, useViewModePreference } from "./ViewModePreference";
import "./DetailView.css";

const setSectionsOpen = (event: React.MouseEvent<HTMLButtonElement>, open: boolean) => {
  const container = event.currentTarget.closest(".detail-view");
  container?.querySelectorAll<HTMLDetailsElement>(".detail-section--collapsible").forEach((section) => {
    section.open = open;
  });
};

export const DetailView = ({ tabs }: { tabs: readonly DetailTab[] }) => {
  const { mode, updateMode } = useViewModePreference();
  const [selectedTab, setSelectedTab] = useState(tabs[0]?.value);

  return (
    <div className="detail-view">
      <div className="detail-view-toolbar">
        <ViewModePicker mode={mode} onChange={updateMode} />
      </div>

      {mode === "tabs" ? (
        <DetailTabs tabs={tabs} />
      ) : mode === "page" ? (
        <div className="detail-page-view">
          <div className="detail-page-controls" role="group" aria-label="Page sections">
            <button type="button" onClick={(event) => setSectionsOpen(event, true)}>
              Expand all
            </button>
            <button type="button" onClick={(event) => setSectionsOpen(event, false)}>
              Collapse all
            </button>
          </div>
          {tabs.map((tab) => (
            <DetailSection key={tab.value} label={tab.label} collapsible>
              {tab.children}
            </DetailSection>
          ))}
        </div>
      ) : (
        <div className="detail-sidebar-view">
          <nav className="detail-sidebar-nav" aria-label="Entity details">
            {tabs.map((tab) => {
              return (
                <a
                  href={`#${tab.value}`}
                  aria-current={selectedTab === tab.value ? "location" : undefined}
                  data-selected={selectedTab === tab.value}
                  key={tab.value}
                  onClick={() => {
                    setSelectedTab(tab.value);
                  }}
                >
                  {tab.label}
                </a>
              );
            })}
          </nav>
          <div className="detail-sidebar-content">
            {tabs.map((tab) => {
              return (
                <div id={tab.value} key={tab.value}>
                  <DetailSection label={tab.label}>{tab.children}</DetailSection>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
