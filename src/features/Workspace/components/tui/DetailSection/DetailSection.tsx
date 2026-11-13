import { Box, Text } from "ink";
import { useTuiInputIfAvailable } from "../Primitives/InputMode";
import type { ReactNode } from "react";
import { useDetailSectionModel } from "../../../hooks/useDetailSectionModel";
export const DetailSection = ({
  label,
  children,
  showLabel = true,
  collapsible = false,
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  label: string;
  children: ReactNode;
  collapsible?: boolean;
  showLabel?: boolean;
}) => {
  const disclosure = useDetailSectionModel({ open, onOpenChange });
  useTuiInputIfAvailable((input) => {
    if (collapsible && input === " ") {
      disclosure.toggle();
    }
  });
  return (
    <Box flexDirection="column" marginTop={1}>
      {showLabel && (
        <Text bold color="yellow">
          {label.toUpperCase()}
          {collapsible ? ` · ${disclosure.isOpen ? "−" : "+"} · Space to toggle` : ""}
        </Text>
      )}
      {(!collapsible || disclosure.isOpen) && children}
    </Box>
  );
};
