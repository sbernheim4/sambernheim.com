import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { createHighlighter } from "@tanstack/highlight/core";
import { rehypeHighlightCodeBlocks } from "@tanstack/highlight/rehype";
import { json } from "@tanstack/highlight/languages/json";
import { plaintext } from "@tanstack/highlight/languages/plaintext";
import { shell } from "@tanstack/highlight/languages/shell";
import { ts } from "@tanstack/highlight/languages/ts";
import { tsx } from "@tanstack/highlight/languages/tsx";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

const highlighter = createHighlighter({
  fallbackLanguage: "plaintext",
  languages: [json, plaintext, shell, ts, tsx],
});

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      rehypePlugins: [[rehypeHighlightCodeBlocks, { highlighter }]],
    }),
    tanstackStart({
      srcDirectory: "src",
    }),
    viteReact(),
  ],
});
