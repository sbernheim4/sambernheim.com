import { Box, Text, useInput, useStdout } from "ink";
import {
  type CommandPaletteMode,
  type CommandPaletteModel,
  shouldRenderCommandPalette,
} from "../../model";
import { useCommandPaletteInputMode } from "../../hooks/tui/useCommandPaletteInputMode";

export const CommandPalette = ({
  mode = "modal",
  model,
}: {
  mode?: CommandPaletteMode;
  model: CommandPaletteModel;
}) => {
  const { mode: inputMode, setMode } = useCommandPaletteInputMode(mode, model.open);
  const { stdout } = useStdout();
  const { query, setQuery, selected: active, setSelected, results, run, running } = model;

  const handleEscape = () => {
    if (inputMode === "insert") {
      setMode("normal");
      return;
    }
    if (mode === "modal") {
      model.close();
    }
    setMode("normal");
  };

  const handleRun = () => {
    return void run();
  };

  const handleMoveUp = () => {
    return setSelected((value) => {
      return Math.max(0, value - 1);
    });
  };

  const handleMoveDown = () => {
    return setSelected((value) => {
      return Math.min(results.length - 1, value + 1);
    });
  };

  const handleNormalInput = (input: string) => {
    switch (input) {
      case "i":
        setMode("insert");
        break;
      case "/":
        setQuery("");
        setMode("insert");
        break;
      case "G":
        setSelected(Math.max(0, results.length - 1));
        break;
    }
  };

  const handleInsertInput = (
    input: string,
    key: { backspace?: boolean; delete?: boolean; ctrl?: boolean; meta?: boolean },
  ) => {
    if (key.backspace || key.delete) {
      setQuery(query.slice(0, -1));
    } else if (input && !key.ctrl && !key.meta) {
      setQuery(query + input);
    }
  };

  useInput((input, key) => {
    if (!shouldRenderCommandPalette(mode, model.open)) {
      return;
    }
    switch (true) {
      case key.escape:
        handleEscape();
        return;
      case key.return:
        handleRun();
        return;
      case key.upArrow || (inputMode === "normal" && input === "k"):
        handleMoveUp();
        return;
      case key.downArrow || (inputMode === "normal" && input === "j"):
        handleMoveDown();
        return;
      case inputMode === "normal":
        handleNormalInput(input);
        return;
      default:
        handleInsertInput(input, key);
    }
  });

  if (!shouldRenderCommandPalette(mode, model.open)) {
    return null;
  }

  return (
    <Box
      flexDirection="column"
      width={mode === "inline" ? "100%" : undefined}
      minWidth={0}
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      marginTop={1}
    >
      <Text bold color="cyan">
        COMMAND PALETTE
      </Text>
      <Text>
        ⌕{" "}
        <Text color="yellow">
          {query}
          {inputMode === "insert" ? "▏" : ""}
        </Text>
      </Text>
      <Box flexDirection="column">
        {results.length ? (
          results
            .slice(
              Math.max(
                0,
                Math.min(
                  active - Math.floor((stdout.rows - 6) / 2),
                  results.length - (stdout.rows - 6),
                ),
              ),
              Math.max(
                0,
                Math.min(
                  active - Math.floor((stdout.rows - 6) / 2),
                  results.length - (stdout.rows - 6),
                ),
              ) + Math.max(1, stdout.rows - 6),
            )
            .map((action, offset) => {
              const index =
                Math.max(
                  0,
                  Math.min(
                    active - Math.floor((stdout.rows - 6) / 2),
                    results.length - (stdout.rows - 6),
                  ),
                ) + offset;
              return (
                <Text
                  key={action.id}
                  inverse={index === active}
                  dimColor={action.enabled === false || running}
                >
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
