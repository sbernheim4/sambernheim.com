import {
  type CommandPaletteMode,
  type CommandPaletteModel,
  shouldRenderCommandPalette,
} from "../../model";
import { useCommandPaletteKeyboard } from "../../hooks/web/useCommandPaletteKeyboard";
import { useCommandPaletteSelectionRef } from "../../hooks/web/useCommandPaletteSelectionRef";
import "./CommandPalette.css";

export const CommandPalette = ({
  mode = "modal",
  model,
}: {
  mode?: CommandPaletteMode;
  model: CommandPaletteModel;
}) => {
  const {
    open,
    toggle,
    close,
    query,
    setQuery,
    selected,
    setSelected,
    running,
    run,
    results,
    groups: orderedGroups,
  } = model;
  const displayResults = results;
  useCommandPaletteKeyboard(mode, toggle, close);
  const selectedOptionRef = useCommandPaletteSelectionRef(selected);

  if (!shouldRenderCommandPalette(mode, open)) {
    return null;
  }

  const palette = (
    <section
      className={`command-palette${mode === "inline" ? " command-palette-inline" : ""}`}
      role={mode === "modal" ? "dialog" : undefined}
      aria-modal={mode === "modal" ? true : undefined}
      aria-label="Command palette"
      onMouseDown={
        mode === "modal"
          ? (event) => {
              return event.stopPropagation();
            }
          : undefined
      }
    >
      <input
        autoFocus={mode === "modal"}
        value={query}
        placeholder="Search commands…"
        aria-label="Search commands"
        onChange={(event) => {
          return setQuery(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelected((value) => {
              return Math.min(value + 1, Math.max(displayResults.length - 1, 0));
            });
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelected((value) => {
              return Math.max(value - 1, 0);
            });
          } else if (event.key === "Enter") {
            void run(displayResults[selected]);
          }
        }}
      />
      <div className="command-palette-results" role="listbox" aria-label="CommandPalette">
        {results.length === 0 ? <p className="command-palette-empty">No commands found.</p> : null}
        {orderedGroups.map(([group, groupActions]) => {
          return (
            <div className="command-palette-group" role="group" aria-label={group} key={group}>
              <h3>{group}</h3>
              {groupActions.map((action) => {
                const index = displayResults.indexOf(action);
                return (
                  <button
                    key={action.id}
                    ref={selected === index ? selectedOptionRef : undefined}
                    type="button"
                    role="option"
                    aria-selected={selected === index}
                    disabled={action.enabled === false || running}
                    onMouseEnter={() => {
                      return setSelected(index);
                    }}
                    onClick={() => {
                      return void run(action);
                    }}
                  >
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );

  return mode === "inline" ? (
    palette
  ) : (
    <div className="command-palette-backdrop" role="presentation" onMouseDown={close}>
      {palette}
    </div>
  );
};
