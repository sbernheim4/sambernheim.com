import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { createContext, useContext, type ReactNode } from "react";
import { Box, Text } from "ink";
import { useTuiWorkspaceNavigation } from "./Navigation";
import { useFieldFocus } from "@features/Forms/components/fields/tui/FieldFocus";
import {
  getCommandLabel,
  useAutomaticCommandAction,
  type CommandOverride,
} from "@features/Commands/commands";

const RegistryContext = createContext(true);
export const LinkNavigation = ({ children }: { children: ReactNode }) => {
  return <RegistryContext.Provider value>{children}</RegistryContext.Provider>;
};
export const Link = ({
  href,
  children,
  command,
}: {
  href: string;
  children: ReactNode;
  command?: CommandOverride;
}) => {
  const insideNavigation = useContext(RegistryContext);
  const navigate = useTuiWorkspaceNavigation();
  const { focused, ref } = useFieldFocus(insideNavigation);
  useTuiInput((_, key) => {
    if (focused && key.return) {
      navigate(href);
    }
  });
  useAutomaticCommandAction({
    kind: "link",
    label: getCommandLabel(children),
    command,
    execute: () => {
      navigate(href);
    },
  });
  return (
    <Box ref={ref}>
      <Text color="cyan" inverse={focused}>
        {children}
        {focused ? " · Enter" : ""}
      </Text>
    </Box>
  );
};
