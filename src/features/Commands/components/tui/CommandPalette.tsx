import { useMemo, useState } from "react";
import { Box, Text, useInput } from "ink";
import { scoreCommandAction, useCommandActions } from "../../commands";
import { useTuiInputMode } from "@features/Workspace/components/tui/Primitives/InputMode";

export const TuiCommandPalette = ({ onClose }: { onClose: () => void }) => {
  const actions = useCommandActions();
  const { mode, setMode } = useTuiInputMode();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const results = useMemo(() => {
    return actions
      .filter((action) => {
        return !action.hidden;
      })
      .map((action) => {
        return { action, score: scoreCommandAction(action, query) };
      })
      .filter(({ score }) => {
        return score >= 0;
      })
      .sort((a, b) => {
        return b.score - a.score || a.action.label.localeCompare(b.action.label);
      })
      .map(({ action }) => {
        return action;
      });
  }, [actions, query]);
  const active = Math.max(0, Math.min(selected, results.length - 1));
  const run = () => {
    const action = results[active];
    if (!action || action.enabled === false) {
      return;
    }
    onClose();
    void action.execute();
  };
  useInput((input, key) => {
    if (key.escape) {
      if (mode === "insert") {
        setMode("normal");
      } else {
        onClose();
      }
      return;
    }
    if (key.return) {
      run();
      return;
    }
    if (key.upArrow || (mode === "normal" && input === "k")) {
      setSelected((value) => {
        return Math.max(0, value - 1);
      });
      return;
    }
    if (key.downArrow || (mode === "normal" && input === "j")) {
      setSelected((value) => {
        return Math.min(results.length - 1, value + 1);
      });
      return;
    }
    if (mode === "normal") {
      if (input === "i" || input === "/") {
        if (input === "/") {
          setQuery("");
          setSelected(0);
        }
        setMode("insert");
      } else if (input === "G") {
        setSelected(Math.max(0, results.length - 1));
      }
      return;
    }
    if (key.backspace || key.delete) {
      setQuery((value) => {
        return value.slice(0, -1);
      });
      setSelected(0);
    } else if (input && !key.ctrl && !key.meta) {
      setQuery((value) => {
        return value + input;
      });
      setSelected(0);
    }
  });
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1} marginTop={1}>
      <Text bold color="cyan">
        COMMAND PALETTE
      </Text>
      <Text dimColor>
        {mode === "insert"
          ? "INSERT · type to search · Esc normal · Enter run"
          : "NORMAL · j/k move · i or / search · Esc close"}
      </Text>
      <Text>
        ⌕{" "}
        <Text color="yellow">
          {query}
          {mode === "insert" ? "▏" : ""}
        </Text>
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {results.length ? (
          results.slice(0, 12).map((action, index) => {
            return (
              <Text key={action.id} inverse={index === active} dimColor={action.enabled === false}>
                {index === active ? "› " : "  "}
                {action.label}
                <Text dimColor> {action.group ?? "Other"}</Text>
              </Text>
            );
          })
        ) : (
          <Text dimColor>No commands found.</Text>
        )}
      </Box>
    </Box>
  );
};
