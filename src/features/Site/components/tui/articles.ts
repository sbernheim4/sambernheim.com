import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import wrapAnsi from "wrap-ansi";
import { createHighlighter } from "@tanstack/highlight/core";
import { json } from "@tanstack/highlight/languages/json";
import { plaintext } from "@tanstack/highlight/languages/plaintext";
import { shell } from "@tanstack/highlight/languages/shell";
import { ts } from "@tanstack/highlight/languages/ts";
import { tsx } from "@tanstack/highlight/languages/tsx";

export type TuiArticle = {
  id: string;
  title: string;
  description: string;
  publishedAt?: string;
  href: string;
  content: string;
};

const extractText = (source: string) => {
  const body = source.replace(/^---[\s\S]*?---\s*/m, "");
  let inCode = false;
  return body
    .split(/\r?\n/)
    .flatMap((line) => {
      if (/^\s*```/.test(line)) {
        inCode = !inCode;
        return [line];
      }
      if (inCode) {
        return [line];
      }
      if (/^\s*(import|export)\s/.test(line)) {
        return [];
      }
      return [
        line
          .replace(/<([A-Z][A-Za-z0-9]*)\b([^>]*)\/>/g, (_tag, name, attrs) => {
            return renderMdxComponent(name, attrs);
          })
          .replace(/<([A-Z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/gs, (_tag, name, children) => {
            return `${renderMdxComponent(name, "")} ${children}`;
          })
          .replace(/<\/?[A-Za-z][A-Za-z0-9.-]*(?:\s[^<>]*?)?\s*\/?>/g, "")
          .replace(/\{[^{}]*\}/g, ""),
      ];
    })
    .join("\n")
    .trim();
};

const renderMdxComponent = (name: string, attributes: string) => {
  if (name === "CycleableDateTime") {
    const value = attributes.match(/value=\{new Date\(["']([^"']+)["']\)\}/)?.[1];
    if (value) {
      const date = new Date(value);
      return `⟦${date.toLocaleString()} · Enter to cycle⟧`;
    }
  }
  if (name === "CycleableDate") {
    const value = attributes.match(/value=\{new Date\(["']([^"']+)["']\)\}/)?.[1];
    if (value) {
      return `⟦${new Date(value).toLocaleDateString()} · Enter to cycle⟧`;
    }
  }
  return `⟦${name} component⟧`;
};

export const loadTuiArticles = (): TuiArticle[] => {
  const directory = resolve(process.cwd(), "src/articles");
  return readdirSync(directory)
    .filter((file) => {
      return file.endsWith(".mdx");
    })
    .map((file) => {
      const source = readFileSync(resolve(directory, file), "utf8");
      const rawTitle =
        source.match(/^\s*title:\s*["']?(.*?)['"]?\s*$/m)?.[1] ??
        file.replace(/\.mdx$/, "").replaceAll("-", " ");
      const title = rawTitle.replace(/\b\w[\w']*/g, (word, offset) => {
        const lower = word.toLowerCase();
        return offset > 0 &&
          ["a", "an", "and", "as", "at", "for", "in", "of", "the", "to"].includes(lower)
          ? lower
          : `${lower[0].toUpperCase()}${lower.slice(1)}`;
      });
      const description = source.match(/^description:\s*["']?(.*?)\s*["']?$/m)?.[1] ?? "Article";
      return {
        id: file,
        title,
        description,
        publishedAt: source.match(/^\s*publishedAt:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1],
        href: `/blog/${file.replace(/\.mdx$/, "")}`,
        content: extractText(source),
      };
    });
};

const ansi = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  italic: "\u001b[3m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  blue: "\u001b[34m",
  gray: "\u001b[90m",
  magenta: "\u001b[35m",
  red: "\u001b[31m",
};
const highlighter = createHighlighter({
  fallbackLanguage: "plaintext",
  languages: [json, plaintext, shell, ts, tsx],
});
const tokenColor: Record<string, string> = {
  attr: ansi.cyan,
  command: ansi.cyan,
  comment: ansi.gray,
  function: ansi.blue,
  keyword: ansi.magenta,
  literal: ansi.yellow,
  meta: ansi.gray,
  number: ansi.yellow,
  operator: ansi.gray,
  property: ansi.cyan,
  string: ansi.green,
  tag: ansi.red,
  type: ansi.cyan,
  variable: ansi.blue,
};
const inline = (text: string) => {
  return text
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      `${ansi.blue}$1${ansi.reset} ${ansi.gray}($2)${ansi.reset}`,
    )
    .replace(/`([^`]+)`/g, `${ansi.yellow}$1${ansi.reset}`)
    .replace(/\*\*([^*]+)\*\*/g, `${ansi.bold}$1${ansi.reset}`)
    .replace(/(^|[^*])\*([^*]+)\*/g, `$1${ansi.italic}$2${ansi.reset}`)
    .replace(/~~([^~]+)~~/g, `${ansi.gray}$1${ansi.reset}`);
};
const formatMarkdown = (markdown: string, title: string, columns: number) => {
  const width = Math.min(88, Math.max(40, Math.floor(columns * 0.68)));
  const left = " ".repeat(Math.max(0, Math.floor((columns - width) / 2)));
  const lines = [
    `${ansi.bold}${ansi.cyan}${title}${ansi.reset}`,
    `${ansi.gray}${"─".repeat(title.length)}${ansi.reset}`,
    "",
  ];
  const sourceLines = markdown.split(/\r?\n/);
  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index];
    const fence = line.match(/^\s*```([\w+-]*)/);
    if (fence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < sourceLines.length && !/^\s*```/.test(sourceLines[index])) {
        codeLines.push(sourceLines[index]);
        index += 1;
      }
      lines.push(`${ansi.gray}┌─ ${fence[1] || "code"} ${"─".repeat(24)}${ansi.reset}`);
      const code = codeLines.join("\n");
      const tokens = highlighter.tokenize(code, { lang: fence[1] }).tokens;
      const highlightedLines = [""];
      for (const token of tokens) {
        const parts = token.value.split("\n");
        parts.forEach((part, partIndex) => {
          if (part) {
            const color = tokenColor[token.className ?? ""];
            highlightedLines[highlightedLines.length - 1] +=
              `${color ?? ""}${part}${color ? ansi.reset : ""}`;
          }
          if (partIndex < parts.length - 1) {
            highlightedLines.push("");
          }
        });
      }
      lines.push(
        ...highlightedLines.map((codeLine) => {
          return `${ansi.gray}│${ansi.reset} ${codeLine}`;
        }),
      );
      lines.push(`${ansi.gray}└${"─".repeat(32)}${ansi.reset}`, "");
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      lines.push(
        "",
        `${ansi.bold}${heading[1].length < 3 ? ansi.cyan : ansi.magenta}${heading[2]}${ansi.reset}`,
      );
      continue;
    }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      lines.push(`${ansi.gray}│${ansi.reset} ${ansi.blue}${inline(quote[1])}${ansi.reset}`);
      continue;
    }
    const item = line.match(/^(\s*)([-+*]|\d+\.)\s+(.*)$/);
    lines.push(
      item ? `${item[1]}${ansi.cyan}${item[2]}${ansi.reset} ${inline(item[3])}` : inline(line),
    );
  }
  const visible = (line: string) => {
    return line.replace(new RegExp(String.fromCharCode(27) + "\\[[0-9;]*m", "g"), "").length;
  };
  return (
    lines
      .flatMap((line) => {
        return wrapAnsi(line, width, { hard: true, trim: false })
          .split("\n")
          .map((part) => {
            return `${left}${part}${" ".repeat(Math.max(0, width - visible(part)))}`;
          });
      })
      .join("\n") + "\n"
  );
};

export const openTuiArticle = (article: TuiArticle) => {
  if (!process.stdin.isTTY) {
    return;
  }
  const folder = mkdtempSync(resolve(tmpdir(), "site-tui-article-"));
  const file = resolve(folder, "article.txt");
  try {
    writeFileSync(
      file,
      formatMarkdown(article.content, article.title, process.stdout.columns ?? 100),
    );
    process.stdout.write("\u001b[2J\u001b[H");
    if (process.stdin.isRaw && process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    spawnSync("less", ["-R", file], { stdio: "inherit" });
  } finally {
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    rmSync(folder, { recursive: true, force: true });
    process.stdout.write("\u001b[2J\u001b[H");
  }
};
