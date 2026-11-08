import {
  createContext,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useInput, type Key } from "ink";

export type TuiInputMode = "normal" | "insert";

const InputModeContext = createContext<{
  mode: TuiInputMode;
  setMode: Dispatch<SetStateAction<TuiInputMode>>;
  paletteOpen: boolean;
  helpOpen: boolean;
} | null>(null);

export const TuiInputModeProvider = ({
  mode,
  setMode,
  paletteOpen,
  helpOpen = false,
  children,
}: {
  mode: TuiInputMode;
  setMode: Dispatch<SetStateAction<TuiInputMode>>;
  paletteOpen: boolean;
  helpOpen?: boolean;
  children: ReactNode;
}) => {
  return (
    <InputModeContext.Provider value={{ mode, setMode, paletteOpen, helpOpen }}>
      {children}
    </InputModeContext.Provider>
  );
};

export const useTuiInputMode = () => {
  const context = useContext(InputModeContext);
  if (!context) {
    throw new Error("TuiInputModeProvider is missing");
  }
  return context;
};

export const useOptionalTuiInputMode = () => {
  return useContext(InputModeContext);
};

export const useTuiInput = (handler: (input: string, key: Key) => void) => {
  const { paletteOpen, helpOpen } = useTuiInputMode();
  useInput(handler, { isActive: !paletteOpen && !helpOpen });
};

export const useTuiInputIfAvailable = (handler: (input: string, key: Key) => void) => {
  const context = useOptionalTuiInputMode();
  useInput(handler, { isActive: !context?.paletteOpen && !context?.helpOpen });
};
