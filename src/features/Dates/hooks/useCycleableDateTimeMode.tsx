import { createContext, useContext, useState, type ReactNode } from "react";

export type CycleableDateTimeMode = "utc" | "relative" | "local";

const CycleableDateTimeContext = createContext<CycleableDateTimeMode>("utc");
const CycleableDateTimeModeContext = createContext<
  ((mode: CycleableDateTimeMode) => void) | null
>(null);

export const useCycleableDateTimeMode = () => {
  return {
    mode: useContext(CycleableDateTimeContext),
    setMode: useContext(CycleableDateTimeModeContext),
  };
};

export const CycleableDateTimeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<CycleableDateTimeMode>("utc");

  return (
    <CycleableDateTimeContext.Provider value={mode}>
      <CycleableDateTimeModeContext.Provider value={setMode}>
        {children}
      </CycleableDateTimeModeContext.Provider>
    </CycleableDateTimeContext.Provider>
  );
};
