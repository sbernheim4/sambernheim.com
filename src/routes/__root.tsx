import type { ReactNode } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CycleableDateTimeProvider } from "../forms/components";
import { GlobalQueryLoader } from "../shared/components/GlobalQueryLoader";
import { TooltipProvider } from "../shared/components/ui/tooltip";
import {
  CommandPalette,
  CommandPaletteProvider,
  useCommandAction,
} from "../shared/commands/commands";
import { ThemeProvider, useTheme } from "../shared/theme/ThemeProvider";
import { SiteNavbar } from "../shared/components/SiteNavbar";
import "../shared/commands/commands.css";

import "../styles.css";

const queryClient = new QueryClient();

type RootSearch = { tab?: string };
const validateSearch = (search: Record<string, unknown>): RootSearch => {
  return typeof search.tab === "string" ? { tab: search.tab } : {};
};

const RootComponent = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CommandPaletteProvider>
        <ThemeProvider>
          <CycleableDateTimeProvider>
            <TooltipProvider>
              <GlobalQueryLoading />
              <CommandPalette />
              <ThemeCommandAction />
              <SiteNavigation />
              <Outlet />
            </TooltipProvider>
          </CycleableDateTimeProvider>
        </ThemeProvider>
      </CommandPaletteProvider>
    </QueryClientProvider>
  );
};

const GlobalQueryLoading = () => {
  const { pathname } = useLocation();

  return pathname.startsWith("/blog") ? null : <GlobalQueryLoader />;
};

const ThemeCommandAction = () => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "light" ? "dark" : "light";

  useCommandAction({
    id: "theme:toggle",
    label: `Switch to ${nextTheme} mode`,
    keywords: ["theme", "appearance", nextTheme],
    group: "Actions",
    execute: toggleTheme,
  });

  return null;
};

const SiteNavigation = () => {
  const { pathname } = useLocation();
  const showNavbar = pathname === "/" || pathname.startsWith("/blog");

  return showNavbar ? <SiteNavbar /> : null;
};

const RootDocument = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  validateSearch,
  head: () => {
    return {
      meta: [
        { charSet: "utf-8" },
        {
          name: "theme-color",
          content: "#111418",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: "Samuel Bernheim — Software Engineer",
        },
      ],
      links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    };
  },
  shellComponent: RootDocument,
  component: RootComponent,
});
