import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { useMemo, useState } from "react";
import { Box, Text } from "ink";
import { useTuiInputMode } from "@features/Workspace/components/tui/Primitives/InputMode";
import { useTuiWorkspaceNavigation } from "@features/Workspace/components/tui/Primitives/Navigation";

export type TuiMenuItem = { label: string; path: string; description: string };

export const TuiMenu = ({ items }: { items: readonly TuiMenuItem[] }) => {
  const { mode, setMode } = useTuiInputMode();
  const navigate = useTuiWorkspaceNavigation();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [lastKey, setLastKey] = useState("");
  const matches = useMemo(() => {
    const normalized = query.toLowerCase();
    return items.filter((item) => {
      return `${item.label} ${item.path} ${item.description}`.toLowerCase().includes(normalized);
    });
  }, [items, query]);
  const active = Math.max(0, Math.min(selected, matches.length - 1));

  useTuiInput((input, key) => {
    if (mode === "insert") {
      if (key.return) {
        setMode("normal");
      } else if (key.backspace || key.delete) {
        setQuery((value) => {
          return value.slice(0, -1);
        });
        setSelected(0);
      } else if (input && !key.ctrl && !key.meta && !key.escape) {
        setQuery((value) => {
          return value + input;
        });
        setSelected(0);
      }
      return;
    }
    if (input === "i" || input === "/") {
      if (input === "/") {
        setQuery("");
        setSelected(0);
      }
      setMode("insert");
      setLastKey("");
    } else if (key.upArrow || input === "k") {
      setSelected((value) => {
        return Math.max(0, Math.min(value, matches.length - 1) - 1);
      });
      setLastKey("");
    } else if (key.downArrow || input === "j") {
      setSelected((value) => {
        return Math.min(matches.length - 1, Math.min(value, matches.length - 1) + 1);
      });
      setLastKey("");
    } else if (input === "G") {
      setSelected(Math.max(0, matches.length - 1));
      setLastKey("");
    } else if (input === "g" && lastKey === "g") {
      setSelected(0);
      setLastKey("");
    } else if (input === "g") {
      setLastKey("g");
    } else if (key.return && matches[active]) {
      navigate(matches[active].path);
    } else if (input === "q") {
      process.kill(process.pid, "SIGINT");
    } else {
      setLastKey("");
    }
  });

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text dimColor>{mode === "insert" ? "Search:" : ""}</Text>
      {(mode === "insert" || query) && (
        <Text>
          Search:{" "}
          <Text color="yellow">
            {query}
            {mode === "insert" ? "▏" : ""}
          </Text>
        </Text>
      )}
      <Box flexDirection="column" marginTop={1}>
        {matches.length ? (
          matches.map((item, index) => {
            return (
              <Text key={item.path} inverse={index === active}>
                {index === active ? "› " : "  "}
                {item.label}
                <Text dimColor> {item.description}</Text>
              </Text>
            );
          })
        ) : (
          <Text dimColor>No matches.</Text>
        )}
      </Box>
    </Box>
  );
};
