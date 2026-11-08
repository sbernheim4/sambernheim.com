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
import { useRef, type RefObject } from "react";
import type { DOMElement } from "ink";

type Focus = {
  active?: string;
  activeHandlesArrows: boolean;
  register: (id: string, handlesArrows: boolean, ref: RefObject<DOMElement | null>) => void;
  unregister: (id: string) => void;
  next: (direction?: number) => void;
};
const FocusContext = createContext<Focus | null>(null);
export const FieldFocusProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<
    { id: string; handlesArrows: boolean; ref: RefObject<DOMElement | null> }[]
  >([]);
  const [position, setPosition] = useState(0);
  const register = useCallback(
    (id: string, handlesArrows: boolean, ref: RefObject<DOMElement | null>) => {
      setItems((current) => {
        if (
          current.some((item) => {
            return item.id === id;
          })
        ) {
          return current.map((item) => {
            return item.id === id ? { id, handlesArrows, ref } : item;
          });
        }
        return [...current, { id, handlesArrows, ref }];
      });
    },
    [],
  );
  const unregister = useCallback((id: string) => {
    setItems((current) => {
      return current.filter((item) => {
        return item.id !== id;
      });
    });
  }, []);
  const orderedItems = [...items].sort((a, b) => {
    const position = (ref: RefObject<DOMElement | null>) => {
      let top = 0;
      let left = 0;
      let node = ref.current;
      while (node) {
        top += node.yogaNode?.getComputedTop() ?? 0;
        left += node.yogaNode?.getComputedLeft() ?? 0;
        node = node.parentNode ?? null;
      }
      return { top, left };
    };
    const first = position(a.ref);
    const second = position(b.ref);
    return first.top - second.top || first.left - second.left;
  });
  const next = useCallback(
    (direction = 1) => {
      setPosition((current) => {
        return orderedItems.length
          ? (current + direction + orderedItems.length) % orderedItems.length
          : 0;
      });
    },
    [orderedItems.length],
  );
  useInput((input, key) => {
    if (items.length === 0) {
      return;
    }
    const previous = key.shift || key.upArrow || key.leftArrow || input === "h" || input === "k";
    const next = key.tab || key.downArrow || key.rightArrow || input === "j" || input === "l";
    if (!previous && !next) {
      return;
    }
    if (orderedItems[position]?.handlesArrows && !key.tab) {
      return;
    }
    const direction = previous ? -1 : 1;
    setPosition((current) => {
      return (current + direction + orderedItems.length) % orderedItems.length;
    });
  });
  return (
    <FocusContext.Provider
      value={{
        active: orderedItems[position]?.id,
        activeHandlesArrows: orderedItems[position]?.handlesArrows ?? false,
        register,
        unregister,
        next,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};
export const useFieldFocus = (enabled = true, handlesArrows = false) => {
  const focus = useContext(FocusContext);
  if (!focus) {
    throw new Error("FieldFocusProvider is missing");
  }
  const id = useId();
  const ref = useRef<DOMElement>(null);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    focus.register(id, handlesArrows, ref);
    return () => {
      focus.unregister(id);
    };
  }, [enabled, handlesArrows, id, focus.register, focus.unregister]);
  return { focused: focus.active === id, next: focus.next, ref };
};
