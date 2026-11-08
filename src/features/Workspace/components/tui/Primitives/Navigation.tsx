import { createContext, useContext, type ReactNode } from "react";

const NavigationContext = createContext<(path: string) => void>(() => {});
export const TuiWorkspaceNavigation = ({
  onNavigate,
  children,
}: {
  onNavigate: (path: string) => void;
  children: ReactNode;
}) => {
  return <NavigationContext.Provider value={onNavigate}>{children}</NavigationContext.Provider>;
};
export const useTuiWorkspaceNavigation = () => {
  return useContext(NavigationContext);
};
