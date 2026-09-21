import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeHighlight from "rehype-highlight";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

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
      rehypePlugins: [rehypeHighlight],
    }),
    tanstackStart({
      srcDirectory: "src",
      router: {
        routeFileIgnorePattern: "(TaskPages|ProcessPages|ThreadPages)\\.tsx$",
      },
    }),
    viteReact(),
  ],
});
