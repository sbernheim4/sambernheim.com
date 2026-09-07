import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { cloudflare } from "@cloudflare/vite-plugin";
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
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
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
