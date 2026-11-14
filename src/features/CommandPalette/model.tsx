/* oxlint-disable arrow-body-style, curly */

import {
  useCallback,
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

export type CommandPaletteMode = "modal" | "inline";

export const shouldRenderCommandPalette = (mode: CommandPaletteMode, open: boolean) => {
  return mode === "inline" || open;
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
export type CommandPaletteState = {
  open: boolean;
  query: string;
  setQuery: (query: string) => void;
  selected: number;
  setSelected: (selected: number | ((previous: number) => number)) => void;
  toggle: () => void;
  close: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteState | null>(null);
const EMPTY_ACTIONS: readonly CommandAction[] = [];
const EMPTY_SUBSCRIBE = () => () => {};

export const CommandPaletteProvider = ({ children }: { children: ReactNode }) => {
  const registry = useMemo(() => new CommandRegistry(), []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const palette = useMemo(
    () => ({
      open,
      query,
      setQuery,
      selected,
      setSelected,
      toggle: () => setOpen((value) => !value),
      close: () => setOpen(false),
    }),
    [open, query, selected],
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

export const useOptionalCommandPalette = () => useContext(CommandPaletteContext);

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

export const scoreCommandAction = (action: CommandAction, query: string) => {
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

export const getCommandResults = (actions: readonly CommandAction[], query: string) => {
  const groups = ["Actions", "Navigation", "Tabs", "Other"];
  const rank = (group: string) => (groups.includes(group) ? groups.indexOf(group) : groups.length);
  const seen = new Set<string>();
  return actions
    .filter((action) => !action.hidden)
    .filter((action) => {
      const key = JSON.stringify([
        action.label,
        action.group ?? "Other",
        action.description ?? "",
        action.keywords ?? [],
        action.enabled ?? true,
        action.priority ?? 0,
      ]);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((action) => ({ action, score: scoreCommandAction(action, query) }))
    .filter(({ score }) => score >= 0)
    .sort(
      (a, b) =>
        rank(a.action.group ?? "Other") - rank(b.action.group ?? "Other") ||
        (a.action.group ?? "Other").localeCompare(b.action.group ?? "Other") ||
        b.score - a.score ||
        a.action.label.localeCompare(b.action.label),
    )
    .map(({ action }) => action);
};

// Search, ordering, selection, disabled guards, and execution belong to one
// headless model. A model instance can drive multiple rendering roots.
export const useCommandPaletteModel = (
  actions: readonly CommandAction[],
  state: CommandPaletteState,
  closeOnRun = false,
) => {
  const results = useMemo(() => getCommandResults(actions, state.query), [actions, state.query]);
  const groups = useMemo(() => {
    const grouped = new Map<string, CommandAction[]>();
    for (const action of results) {
      const group = action.group ?? "Other";
      grouped.set(group, [...(grouped.get(group) ?? []), action]);
    }
    return [...grouped.entries()];
  }, [results]);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const selected = Math.max(0, Math.min(state.selected, results.length - 1));
  const setQuery = useCallback(
    (query: string) => {
      state.setQuery(query);
      state.setSelected(0);
    },
    [state.setQuery, state.setSelected],
  );
  const setSelected: CommandPaletteState["setSelected"] = (next) => {
    const index = typeof next === "function" ? next(selected) : next;
    state.setSelected(Math.max(0, Math.min(index, results.length - 1)));
  };
  const run = async (action = results[selected]) => {
    if (!action || action.enabled === false || runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    try {
      await action.execute();
      if (closeOnRun) state.close();
      setQuery("");
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  };
  return {
    ...state,
    query: state.query,
    setQuery,
    selected,
    setSelected,
    results,
    groups,
    running,
    run,
  };
};
export type CommandPaletteModel = ReturnType<typeof useCommandPaletteModel>;

export const getCommandLabel = getTextContent;
