import { createContext, useContext, useState, type ReactNode } from "react";

export type CycleableDateTimeMode = "utc" | "relative" | "local";

export const cycleableDateTimeModes = ["utc", "relative", "local"] as const;
export const cycleableDateModes = ["utc", "relative"] as const;

export const resolveCycleableDateTimeMode = (
  mode: CycleableDateTimeMode,
  availableModes: readonly CycleableDateTimeMode[] = cycleableDateTimeModes,
) => {
  return availableModes.includes(mode) ? mode : (availableModes[0] ?? "utc");
};

export const getNextCycleableDateTimeMode = (
  mode: CycleableDateTimeMode,
  availableModes: readonly CycleableDateTimeMode[] = cycleableDateTimeModes,
) => {
  return availableModes[(availableModes.indexOf(mode) + 1) % availableModes.length] ?? "utc";
};

const CycleableDateTimeContext = createContext<CycleableDateTimeMode>("utc");
const CycleableDateTimeModeContext = createContext<((mode: CycleableDateTimeMode) => void) | null>(
  null,
);

export const useCycleableDateTimeMode = () => {
  return {
    mode: useContext(CycleableDateTimeContext),
    setMode: useContext(CycleableDateTimeModeContext),
  };
};

export const CycleableDateTimeProvider = ({
  children,
  mode: controlledMode,
  onModeChange,
}: {
  children: ReactNode;
  mode?: CycleableDateTimeMode;
  onModeChange?: (mode: CycleableDateTimeMode) => void;
}) => {
  const [localMode, setLocalMode] = useState<CycleableDateTimeMode>("utc");
  const mode = controlledMode ?? localMode;
  const setMode = (next: CycleableDateTimeMode) => {
    if (controlledMode === undefined) {
      setLocalMode(next);
    }
    onModeChange?.(next);
  };

  return (
    <CycleableDateTimeContext.Provider value={mode}>
      <CycleableDateTimeModeContext.Provider value={setMode}>
        {children}
      </CycleableDateTimeModeContext.Provider>
    </CycleableDateTimeContext.Provider>
  );
};
