import type { ReactNode } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CycleableDateTimeProvider } from "@/features";
import { TooltipProvider } from "@/features";
import { CommandPalette, CommandPaletteProvider, useCommandAction } from "@/features";
import { ThemeProvider, useTheme } from "@/features";
import { SiteNavbar } from "@/features";
import "@/features/Commands/commands.css";

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
  const showNavbar =
    pathname === "/" || pathname.startsWith("/blog") || pathname.startsWith("/experiments");

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
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const saved = localStorage.getItem("sambernheim-theme");
                const theme = saved === "dark" || saved === "light"
                  ? saved
                  : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                document.documentElement.dataset.theme = theme;
                document.documentElement.style.colorScheme = theme;
              } catch {}
            })();`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
};

const NotFound = () => {
  return (
    <main>
      <h1>Page not found</h1>
      <p>The page you requested doesn’t exist.</p>
      <a href="/">Return home</a>
    </main>
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
  notFoundComponent: NotFound,
});
