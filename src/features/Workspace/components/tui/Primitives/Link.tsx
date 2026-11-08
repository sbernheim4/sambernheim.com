import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Text } from "ink";
import { useTuiWorkspaceNavigation } from "./Navigation";
import {
  getCommandLabel,
  useAutomaticCommandAction,
  type CommandOverride,
} from "@features/Commands/commands";

type Registry = {
  register: (href: string) => void;
  unregister: (href: string) => void;
  selected?: string;
};
const RegistryContext = createContext<Registry | null>(null);
export const LinkNavigation = ({ children }: { children: ReactNode }) => {
  const navigate = useTuiWorkspaceNavigation();
  const [paths, setPaths] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const register = useCallback((href: string) => {
    setPaths((current) => {
      return current.includes(href) ? current : [...current, href];
    });
  }, []);
  const unregister = useCallback((href: string) => {
    setPaths((current) => {
      return current.filter((path) => {
        return path !== href;
      });
    });
  }, []);
  const registry = useMemo(() => {
    return { register, unregister, selected: paths[selected] };
  }, [register, unregister, paths, selected]);
  useTuiInput((input, key) => {
    if (key.upArrow || input === "k") {
      setSelected((value) => {
        return Math.max(0, value - 1);
      });
    } else if (key.downArrow || input === "j") {
      setSelected((value) => {
        return Math.min(paths.length - 1, value + 1);
      });
    } else if (key.return && paths[selected]) {
      navigate(paths[selected]);
    }
  });
  return <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>;
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
  const registry = useContext(RegistryContext);
  const navigate = useTuiWorkspaceNavigation();
  useAutomaticCommandAction({
    kind: "link",
    label: getCommandLabel(children),
    command,
    execute: () => {
      navigate(href);
    },
  });
  useEffect(() => {
    registry?.register(href);
    return () => {
      registry?.unregister(href);
    };
  }, [href, registry?.register, registry?.unregister]);
  return (
    <Text color="cyan" inverse={registry?.selected === href}>
      {children}
    </Text>
  );
};
