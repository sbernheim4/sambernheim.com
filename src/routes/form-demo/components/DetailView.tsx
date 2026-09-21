import type { DetailTab } from "./DetailTabs";
import { DetailTabs } from "./DetailTabs";
import { ViewModePicker, useViewModePreference } from "./ViewModePreference";
import "./DetailView.css";

export const DetailView = ({ tabs }: { tabs: readonly DetailTab[] }) => {
  const { mode, updateMode } = useViewModePreference();

  return (
    <div className="detail-view">
      <div className="detail-view-toolbar">
        <ViewModePicker mode={mode} onChange={updateMode} />
      </div>

      {mode === "tabs" ? (
        <DetailTabs tabs={tabs} />
      ) : (
        <div className="detail-page-view">
          {tabs.map((tab) => {
            return (
              <section className="detail-page-section" key={tab.value}>
                <div className="detail-page-section-heading">
                  <span className="eyebrow">{tab.label}</span>
                </div>
                {tab.children}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
