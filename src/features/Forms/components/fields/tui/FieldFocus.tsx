import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { useInput } from "ink";

type Focus = {
  active?: string;
  register: (id: string) => void;
  unregister: (id: string) => void;
  next: () => void;
};
const FocusContext = createContext<Focus | null>(null);
export const FieldFocusProvider = ({ children }: { children: ReactNode }) => {
  const [ids, setIds] = useState<string[]>([]);
  const [position, setPosition] = useState(0);
  const register = useCallback((id: string) => {
    setIds((current) => {
      return current.includes(id) ? current : [...current, id];
    });
  }, []);
  const unregister = useCallback((id: string) => {
    setIds((current) => {
      return current.filter((item) => {
        return item !== id;
      });
    });
  }, []);
  const next = useCallback(() => {
    setPosition((current) => {
      return ids.length ? (current + 1) % ids.length : 0;
    });
  }, [ids.length]);
  useInput((_, key) => {
    if (!key.tab || ids.length === 0) {
      return;
    }
    setPosition((current) => {
      return (current + (key.shift ? -1 : 1) + ids.length) % ids.length;
    });
  });
  return (
    <FocusContext.Provider value={{ active: ids[position], register, unregister, next }}>
      {children}
    </FocusContext.Provider>
  );
};
export const useFieldFocus = () => {
  const focus = useContext(FocusContext);
  if (!focus) {
    throw new Error("FieldFocusProvider is missing");
  }
  const id = useId();
  useEffect(() => {
    focus.register(id);
    return () => {
      focus.unregister(id);
    };
  }, [id, focus.register, focus.unregister]);
  return { focused: focus.active === id, next: focus.next };
};
