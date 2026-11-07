import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = "sambernheim-theme";

const getRouteDefault = (pathname: string): Theme => {
  return pathname === "/" ? "dark" : pathname.startsWith("/blog") ? "light" : "dark";
};

const getInitialTheme = (pathname: string): Theme => {
  if (typeof window === "undefined") {
    return getRouteDefault(pathname);
  }
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme(pathname));
  const [hasSavedTheme, setHasSavedTheme] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "dark" || saved === "light";
  });

  const updateTheme = (nextTheme: Theme) => {
    setHasSavedTheme(true);
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (hasSavedTheme) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateFromSystem = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", updateFromSystem);
    return () => mediaQuery.removeEventListener("change", updateFromSystem);
  }, [hasSavedTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: updateTheme,
        toggleTheme: () => {
          updateTheme(theme === "light" ? "dark" : "light");
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};

export const useOptionalTheme = () => {
  return useContext(ThemeContext);
};
