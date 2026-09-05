import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { handleApiRequest } from "./server/example-api";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      ty_wasm: "/src/wasm/ty/pkg/ty_wasm",
    },
  },
  plugins: [
    {
      name: "example-api",
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (!request.url?.startsWith("/api/")) {
            next();
            return;
          }

          void handleApiRequest(request, response);
        });
      },
    },
    tanstackStart({
      srcDirectory: "src",
    }),
    viteReact(),
  ],
});
