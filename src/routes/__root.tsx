import type { ReactNode } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CycleableDateTimeProvider } from "../forms/components";
import { GlobalQueryLoader } from "../shared/components/GlobalQueryLoader";
import { TooltipProvider } from "../shared/components/ui/tooltip";
import { CommandPalette, CommandPaletteProvider } from "../shared/commands/commands";
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
        <CycleableDateTimeProvider>
          <TooltipProvider>
            <GlobalQueryLoader />
            <CommandPalette />
            <Outlet />
          </TooltipProvider>
        </CycleableDateTimeProvider>
      </CommandPaletteProvider>
    </QueryClientProvider>
  );
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
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: "Monaco ty WASM Editor",
        },
      ],
    };
  },
  shellComponent: RootDocument,
  component: RootComponent,
  ssr: false,
});
