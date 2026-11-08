import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import type { DOMElement } from "ink";

export type ArticleControl = {
  id: string;
  label: string;
  ref: RefObject<DOMElement | null>;
  activate: () => void;
};
type ArticleFocusValue = {
  focusedId: string | null;
  register: (control: ArticleControl) => () => void;
};
const ArticleFocusContext = createContext<ArticleFocusValue | null>(null);
export const ArticleFocusProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: ArticleFocusValue;
}) => {
  return <ArticleFocusContext.Provider value={value}>{children}</ArticleFocusContext.Provider>;
};
export const useArticleControl = ({
  label,
  onActivate,
}: {
  label: string;
  onActivate: () => void;
}) => {
  const context = useContext(ArticleFocusContext);
  if (!context) {
    throw new Error("Article controls require an ArticleFocusProvider");
  }
  const { register, focusedId } = context;
  const id = useId();
  const ref = useRef<DOMElement>(null);
  const callback = useRef(onActivate);
  callback.current = onActivate;
  const activate = useCallback(() => {
    callback.current();
  }, []);
  useEffect(() => {
    return register({ id, label, ref, activate });
  }, [register, id, label, activate]);
  return { focused: focusedId === id, ref };
};
