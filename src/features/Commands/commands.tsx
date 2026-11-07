/* oxlint-disable arrow-body-style, curly */

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type CommandAction = {
  id: string;
  label: string;
  keywords?: readonly string[];
  group?: string;
  description?: string;
  hidden?: boolean;
  enabled?: boolean;
  priority?: number;
  execute: () => void | Promise<void>;
};

export type CommandMetadata = {
  id?: string;
  label?: string;
  keywords?: readonly string[];
  group?: string;
  description?: string;
  hidden?: boolean;
  enabled?: boolean;
  priority?: number;
};

export type CommandOverride = false | CommandMetadata;

class CommandRegistry {
  private readonly actions = new Map<string, CommandAction>();
  private readonly listeners = new Set<() => void>();
  private snapshot: readonly CommandAction[] = [];

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  register(action: CommandAction) {
    this.actions.set(action.id, action);
    this.publish();
    return () => {
      if (this.actions.get(action.id) === action) {
        this.actions.delete(action.id);
        this.publish();
      }
    };
  }

  private publish() {
    this.snapshot = [...this.actions.values()];
    for (const listener of this.listeners) listener();
  }
}

const CommandRegistryContext = createContext<CommandRegistry | null>(null);
type CommandPaletteContextValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);
const EMPTY_ACTIONS: readonly CommandAction[] = [];
const EMPTY_SUBSCRIBE = () => () => {};

export const CommandPaletteProvider = ({ children }: { children: ReactNode }) => {
  const registry = useMemo(() => new CommandRegistry(), []);
  const [open, setOpen] = useState(false);
  const palette = useMemo(
    () => ({
      open,
      toggle: () => setOpen((value) => !value),
      close: () => setOpen(false),
    }),
    [open],
  );
  return (
    <CommandRegistryContext.Provider value={registry}>
      <CommandPaletteContext.Provider value={palette}>{children}</CommandPaletteContext.Provider>
    </CommandRegistryContext.Provider>
  );
};

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) throw new Error("useCommandPalette must be used inside CommandPaletteProvider");
  return context;
};

export const useCommandActions = () => {
  const registry = useContext(CommandRegistryContext);
  return useSyncExternalStore(
    registry?.subscribe ?? EMPTY_SUBSCRIBE,
    registry?.getSnapshot ?? (() => EMPTY_ACTIONS),
    () => EMPTY_ACTIONS,
  );
};

export const useCommandAction = (action: CommandAction | null) => {
  const registry = useContext(CommandRegistryContext);
  const executeRef = useRef(action?.execute);
  executeRef.current = action?.execute;

  useEffect(() => {
    if (!registry || !action || !action.label.trim()) return;

    return registry.register({
      ...action,
      execute: () => executeRef.current?.(),
    });
    // Metadata changes re-register the action; execute is intentionally kept in a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    registry,
    action?.id,
    action?.label,
    action?.group,
    action?.description,
    action?.hidden,
    action?.enabled,
    action?.priority,
    action?.keywords?.join("\u0000"),
  ]);
};

const getTextContent = (value: ReactNode): string => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(getTextContent).join(" ");
  return "";
};

export const useAutomaticCommandAction = ({
  kind,
  label,
  command,
  execute,
  defaultId,
}: {
  kind: string;
  label: string;
  command?: CommandOverride;
  execute: () => void | Promise<void>;
  defaultId?: string;
}) => {
  const generatedId = useId();
  const metadata = command === false ? null : (command ?? {});
  const action = metadata
    ? {
        id: metadata.id ?? defaultId ?? `${kind}:${generatedId}`,
        label: metadata.label ?? label,
        keywords: metadata.keywords,
        group:
          metadata.group ?? (kind === "link" ? "Navigation" : kind === "tab" ? "Tabs" : "Actions"),
        description: metadata.description,
        hidden: metadata.hidden,
        enabled: metadata.enabled ?? true,
        priority: metadata.priority,
        execute,
      }
    : null;

  useCommandAction(action);
};

const scoreAction = (action: CommandAction, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return action.priority ?? 0;
  const label = action.label.toLowerCase();
  const keywords = action.keywords?.join(" ").toLowerCase() ?? "";
  if (label === normalized) return 10000;
  if (label.startsWith(normalized)) return 5000;
  if (label.includes(normalized)) return 3000;
  if (keywords.includes(normalized)) return 1000;
  return -1;
};

export const CommandPalette = () => {
  const { open, toggle, close } = useCommandPalette();
  const actions = useCommandActions();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [running, setRunning] = useState(false);
  const selectedOptionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, toggle]);

  const results = actions
    .filter((action) => !action.hidden)
    .map((action) => ({ action, score: scoreAction(action, query) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score || a.action.label.localeCompare(b.action.label))
    .map(({ action }) => action);

  const groupedResults = results.reduce<Map<string, CommandAction[]>>((groups, action) => {
    const group = action.group ?? "Other";
    const current = groups.get(group) ?? [];
    current.push(action);
    groups.set(group, current);
    return groups;
  }, new Map());
  const orderedGroups = [...groupedResults.entries()].sort(([a], [b]) => {
    const order = ["Actions", "Navigation", "Tabs", "Other"];
    return (
      (order.indexOf(a) === -1 ? order.length : order.indexOf(a)) -
        (order.indexOf(b) === -1 ? order.length : order.indexOf(b)) || a.localeCompare(b)
    );
  });
  const displayResults = orderedGroups.flatMap(([, groupActions]) => groupActions);

  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    selectedOptionRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [selected]);

  if (!open) return null;

  const run = async (action: CommandAction | undefined) => {
    if (!action || action.enabled === false || running) return;
    setRunning(true);
    try {
      await action.execute();
      close();
      setQuery("");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div
      className="command-palette-backdrop"
      role="presentation"
      onMouseDown={close}
    >
      <section
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          placeholder="Search commands…"
          aria-label="Search commands"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setSelected((value) => Math.min(value + 1, Math.max(displayResults.length - 1, 0)));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setSelected((value) => Math.max(value - 1, 0));
            } else if (event.key === "Enter") {
              void run(displayResults[selected]);
            }
          }}
        />
        <div className="command-palette-results" role="listbox" aria-label="Commands">
          {results.length === 0 ? (
            <p className="command-palette-empty">No commands found.</p>
          ) : null}
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
                      onMouseEnter={() => setSelected(index)}
                      onClick={() => void run(action)}
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
    </div>
  );
};

export const getCommandLabel = getTextContent;
