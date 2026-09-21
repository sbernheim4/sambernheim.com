import type { ReactNode } from "react";
import { useExecutionProfile } from "../../../domains/execution-profiles/hooks/useExecutionProfile";
import "./DetailHelpers.css";

export const ProfileSummary = ({ id }: { id: string }) => {
  const profile = useExecutionProfile(id);

  if (profile.isPending) {
    return <p>Loading profile...</p>;
  }

  return (
    <p>
      {profile.data
        ? `${profile.data.name} · ${profile.data.runtime} · ${profile.data.region}`
        : "No profile"}
    </p>
  );
};

export const ChildList = ({ children }: { children: ReactNode }) => {
  return <div className="relationship-list">{children}</div>;
};
