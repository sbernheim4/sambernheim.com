import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CommandButton, useCommandPalette } from "@/features";
import { CommandPalette } from "@/features/CommandPalette/components/web/CommandPalette";
import { useCommandActions, useCommandPaletteModel } from "@/features/CommandPalette/model";

const CommandPaletteExperiment = () => {
  const [count, setCount] = useState(0);
  const [noteVisible, setNoteVisible] = useState(true);
  const paletteState = useCommandPalette();
  const actions = useCommandActions();
  const commandModel = useCommandPaletteModel(actions, paletteState);
  const queryRef = useRef(commandModel.query);
  queryRef.current = commandModel.query;

  useEffect(() => {
    commandModel.setQuery("counter");
    return () => {
      if (queryRef.current === "counter") {
        commandModel.setQuery("");
      }
    };
  }, [commandModel.setQuery]);
  return (
    <section className="playground-page">
      <header className="playground-heading">
        <h1>A command palette that builds itself.</h1>
        <p>
          Links, buttons, tabs, and other UI elements register commands automatically when they
          render. The palette stays in sync with what’s on the page. No manual registration required
          and of course components can be opted out if their action shouldn't appear.
        </p>
        <p className="views-playground-note command-palette-note">
          Modify the search term to see what other options are available. This is synced with the
          website’s command palette, which you can open with ⌘K or Ctrl+K.
        </p>
      </header>
      <div className="command-palette-layout">
        <div className="forms-playground-card command-palette-demo">
          <section className="command-demo-box">
            <h2>Counter</h2>
            <p className="command-palette-count" aria-live="polite">
              {count}
            </p>
            <div className="command-counter-actions">
              <CommandButton
                type="button"
                command={{ group: "Demo actions", description: "Increment the counter" }}
                onClick={() => {
                  return setCount((value) => {
                    return value + 1;
                  });
                }}
              >
                Increment counter
              </CommandButton>
              <CommandButton
                type="button"
                command={{ group: "Demo actions", description: "Decrement the counter" }}
                onClick={() => {
                  return setCount((value) => {
                    return value - 1;
                  });
                }}
              >
                Decrement counter
              </CommandButton>
              <CommandButton
                type="button"
                command={{ group: "Demo actions", description: "Reset the demo counter" }}
                onClick={() => {
                  return setCount(0);
                }}
              >
                Reset counter
              </CommandButton>
            </div>
            <small className="command-counter-optout-copy">
              This button works, but doesn’t appear in the palette.
            </small>
            <CommandButton
              type="button"
              command={false}
              onClick={() => {
                return setCount(5000);
              }}
            >
              Set counter to 5,000
            </CommandButton>
          </section>
          <section className="command-demo-box">
            <h2>Page note</h2>
            <CommandButton
              type="button"
              command={{ group: "Demo actions", description: "Toggle the small page note" }}
              onClick={() => {
                return setNoteVisible((visible) => {
                  return !visible;
                });
              }}
            >
              Toggle note
            </CommandButton>
            {noteVisible && (
              <p className="command-palette-demo-note">
                This note can be toggled from the page or the palette.
              </p>
            )}
          </section>
        </div>
        <aside aria-label="Command palette">
          <CommandPalette mode="inline" model={commandModel} />
        </aside>
      </div>
    </section>
  );
};

export const Route = createFileRoute("/experiments/command-palette")({
  head: () => {
    return { meta: [{ title: "Command palette — Samuel Bernheim" }] };
  },
  component: CommandPaletteExperiment,
});
