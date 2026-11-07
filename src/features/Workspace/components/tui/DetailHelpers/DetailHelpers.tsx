import { Box, Text } from "ink";
import type { ReactNode } from "react";
import { useExecutionProfile } from "@features/ExecutionProfiles/hooks/useExecutionProfile";
export const DetailProperties = ({
  properties,
}: {
  properties: readonly { label: string; value: ReactNode }[];
}) => (
  <Box flexDirection="column">
    {properties.map((property) => (
      <Text key={property.label}>
        <Text color="gray">{property.label}: </Text>
        {property.value}
      </Text>
    ))}
  </Box>
);
export const ChildList = ({ children }: { children: ReactNode }) => (
  <Box flexDirection="column">{children}</Box>
);
export const ProfileSummary = ({ id }: { id: string }) => {
  const profile = useExecutionProfile(id);
  if (profile.isPending) return <Text dimColor>Loading profile…</Text>;
  if (!profile.data) return <Text dimColor>No profile</Text>;
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
