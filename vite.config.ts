import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type PreviewServer, type ViteDevServer } from "vite";

import { handleApiRequest } from "./server/example-api";
const installExampleApi = (server: ViteDevServer | PreviewServer) => {
  server.middlewares.use((request, response, next) => {
    if (!request.url?.startsWith("/api/")) {
      next();
      return;
    }
    void handleApiRequest(request, response);
  });
};

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
      configureServer: installExampleApi,
      configurePreviewServer: installExampleApi,
    },
    tanstackStart({
      srcDirectory: "src",
    }),
    viteReact(),
  ],
});
