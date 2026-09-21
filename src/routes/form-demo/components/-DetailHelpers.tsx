import type { ReactNode } from "react";
import { useExecutionProfile } from "../../../domains/execution-profiles/hooks/useExecutionProfile";
import "./DetailHelpers.css";

export const ProfileSummary = ({ id }: { id: string }) => {
  const profile = useExecutionProfile(id);

  if (profile.isPending) {
    return <p>Loading profile...</p>;
  }

  if (!profile.data) {
    return <p>No profile</p>;
  }

  return (
    <DetailProperties
      properties={[
        { label: "ID", value: profile.data.id },
        { label: "Name", value: profile.data.name },
        { label: "Runtime", value: profile.data.runtime },
        { label: "Region", value: profile.data.region },
        { label: "Timeout", value: `${profile.data.timeoutMs} ms` },
        { label: "Memory limit", value: `${profile.data.memoryLimitMb} MB` },
      ]}
    />
  );
};

export const DetailProperties = ({
  properties,
}: {
  properties: readonly { label: string; value: ReactNode }[];
}) => {
  return (
    <dl className="detail-properties">
      {properties.map((property) => {
        return (
          <div className="detail-property" key={property.label}>
            <dt className="eyebrow">{property.label}</dt>
            <dd>{property.value}</dd>
          </div>
        );
      })}
    </dl>
  );
};

export const ChildList = ({ children }: { children: ReactNode }) => {
  return <div className="relationship-list">{children}</div>;
};
