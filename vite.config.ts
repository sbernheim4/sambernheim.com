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
import { aliases } from "./config/aliases";

const highlighter = createHighlighter({
  fallbackLanguage: "plaintext",
  languages: [json, plaintext, shell, ts, tsx],
});

export default defineConfig(({ mode }) => {
  const articleMdx = mdx({
    remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: "meta" }]],
    rehypePlugins: [[rehypeHighlightCodeBlocks, { highlighter }]],
  });
  return {
    server: {
      port: 3000,
    },
    resolve: {
      alias: [...(mode === "tui" ? [] : [{ find: /^ink$/, replacement: "ink-web" }]), ...aliases],
    },
    plugins: [
      ...(mode === "tui" ? [] : [cloudflare({ viteEnvironment: { name: "ssr" } })]),
      {
        ...articleMdx,
        transform(source, id) {
          // MDX's own filter strips queries. Preserve Vite's raw source exports
          // so the embedded TUI can compile articles with its Ink components.
          if (/[?&]raw(?:&|$)/.test(id)) {
            return;
          }
          return articleMdx.transform(source, id);
        },
      },
      tanstackStart({
        srcDirectory: "src",
        router: {
          routeFileIgnorePattern: "^ComponentLibrary$",
        },
      }),
      viteReact(),
    ],
  };
});
