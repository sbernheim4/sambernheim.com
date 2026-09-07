import type { ReactNode } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "../styles.css";

const queryClient = new QueryClient();
const RootComponent = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
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
