import { CycleableDate, CycleableDateTime } from "../forms/components";
import { DetailView } from "../pages/form-demo/components/DetailView";
import "./EntityDetailDensityExample.css";

export const EntityDetailDensityExample = () => {
  return (
    <div className="entity-detail-density-example">
      <DetailView
        tabs={[
          {
            value: "overview",
            label: "Overview",
            children: (
              <div className="entity-detail-density-example__content">
                <p className="entity-detail-density-example__title">Acme Workspace</p>
                <p>Active customer workspace with 24 members.</p>
                <p className="entity-detail-density-example__metadata">
                  Created <CycleableDate value={new Date("2024-06-04T00:00:00.000Z")} />
                </p>
              </div>
            ),
          },
          {
            value: "activity",
            label: "Activity",
            children: (
              <div className="entity-detail-density-example__content">
                <p>
                  Last deployment succeeded{" "}
                  <CycleableDateTime value={new Date("2026-10-18T18:00:00.000Z")} />.
                </p>
              </div>
            ),
          },
          {
            value: "settings",
            label: "Settings",
            children: (
              <div className="entity-detail-density-example__content">
                <dl className="entity-detail-density-example__properties">
                  <div>
                    <dt>Region</dt>
                    <dd>us-east-1</dd>
                  </div>
                  <div>
                    <dt>Retention</dt>
                    <dd>30 days</dd>
                  </div>
                </dl>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
