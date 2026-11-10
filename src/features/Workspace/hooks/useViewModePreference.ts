import { useEffect, useState } from "react";
export type ViewMode = "tabs" | "page" | "sidebar";
const key = "workspace:view-mode";
const readMode = (): ViewMode => {
  if (typeof window === "undefined") {
    return "tabs";
  }
  const stored = window.localStorage.getItem(key);
  return stored === "page" || stored === "sidebar" ? stored : "tabs";
};
export const useViewModePreference = () => {
  const [mode, setMode] = useState<ViewMode>("tabs");
  useEffect(() => {
    setMode(readMode());
  }, []);
  const updateMode = (nextMode: ViewMode) => {
    setMode(nextMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, nextMode);
    }
  };
  return { mode, updateMode };
};
