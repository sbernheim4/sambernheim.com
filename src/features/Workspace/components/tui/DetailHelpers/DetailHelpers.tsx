import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Box, Text } from "ink";
import { useExecutionProfile } from "@features/ExecutionProfiles/hooks/useExecutionProfile";

const DetailValue = ({ value }: { value: ReactNode }) => {
  if (typeof value === "string" || typeof value === "number") {
    return <Text>{value}</Text>;
  }
  if (Array.isArray(value)) {
    return value.map((child, index) => {
      return <DetailValue key={index} value={child} />;
    });
  }
  if (isValidElement<{ children?: ReactNode }>(value) && value.type === Fragment) {
    return Children.map(value.props.children, (child) => {
      return <DetailValue value={child} />;
    });
  }
  return value;
};
export const DetailProperties = ({
  properties,
}: {
  properties: readonly { label: string; value: ReactNode }[];
}) => {
  return (
    <Box flexDirection="column">
      {properties.map((property) => {
        return (
          <Box key={property.label} flexDirection="row">
            <Text color="gray">{property.label}: </Text>
            <DetailValue value={property.value} />
          </Box>
        );
      })}
    </Box>
  );
};
export const ChildList = ({ children }: { children: ReactNode }) => {
  return <Box flexDirection="column">{children}</Box>;
};
export const ProfileSummary = ({ id }: { id: string }) => {
  const profile = useExecutionProfile(id);
  if (profile.isPending) {
    return <Text dimColor>Loading profile…</Text>;
  }
  if (!profile.data) {
    return <Text dimColor>No profile</Text>;
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
